import { loadTaxonomy } from './taxonomy.js';
import { detectGaps } from './followup.js';

// Owner email copies. Brevo is only a transport; D1 remains the source of truth.
const CARE_ORIGIN='https://realmwright-care.mdnahin537.workers.dev';

export function careFollowupLabel(payload,f) {return detectGaps(payload).find(q=>q.q===f.q)?.prompt || String(f.q).replace(/_/g,' ');}
export function careAnswerLabel(payload,f) {return detectGaps(payload).find(q=>q.q===f.q)?.options.find(o=>o.key===f.a)?.label || String(f.a).replace(/_/g,' ');}
function mailText(value) {return typeof value==='string' && value.length?value:typeof value==='number'?String(value):'Not supplied';}
export async function composeCareMail(env,event) {
  const data=JSON.parse(event.snapshot);
  const taxonomy=await loadTaxonomy(env);
  const p=data.payload?JSON.parse(data.payload):{};
  const area=taxonomy.areas.find(a=>a.key===data.area) || (taxonomy.ideaExtraTile.key===data.area?taxonomy.ideaExtraTile:null);
  const areas=(area?.parts || []).flatMap(x=>[x,...(x.children||[])]);
  const label=(list,key)=>list?.find(x=>x.key===key)?.label || (key?String(key).replace(/_/g,' '):'Not supplied');
  const kind=event.kind==='comment'?'COMMENT':event.kind==='followup'?'UPDATED':data.type==='idea'?'IDEA':'BUG';
  const subject=`[RealmWright ${kind}] #${data.itemId} ${mailText(data.title)}`.replace(/[\r\n]/g,' ').slice(0,220);
  const fields={
    _subject:subject,_template:'table',_captcha:'false',
    'Event':event.kind==='followup'?'Additional answers — complete updated report':event.kind==='comment'?'New comment':'New customer submission',
    'Reference':event.event_key,
    'Report':`#${data.itemId}: ${mailText(data.title)}`,
    'Category':data.type==='idea'?'Feature / workflow idea':'Bug report',
    'Area':area?.label || mailText(data.area),
    'Submitted (Bangladesh)':new Date(event.created_at*1000).toLocaleString('en-GB',{timeZone:'Asia/Dhaka',dateStyle:'medium',timeStyle:'long'}),
    'Submitted (UTC)':new Date(event.created_at*1000).toISOString(),
    'Contributor':mailText(data.name || 'A GM'),
    'Reply address':data.email || 'Not supplied — reply on the Customer Care board',
    'Visibility':data.held?'Awaiting owner review':'Public on the Customer Care board',
    'Open report':`${CARE_ORIGIN}/item/?id=${data.itemId}`,
    'Owner Desk':`${CARE_ORIGIN}/desk/`,
  };
  if(event.kind==='comment') {
    fields['Comment']=mailText(data.body);
    fields['In reply to']=data.parentId?`Comment #${data.parentId}`:'Main report';
  } else {
    fields['Submission ID']=String(data.reportId);
    fields['Part']=label(areas,p.part);
    if(data.type==='bug') {
      fields['Symptom']=label([...(taxonomy.symptomsUniversal||[]),...(taxonomy.symptomsByArea?.[data.area]||[])],p.symptom);
      fields['Symptom detail']=mailText(p.symptom_detail?.replace(/_/g,' '));
      fields['Frequency']=label(taxonomy.frequency,p.frequency);
      fields['Expected']=mailText(p.expected);
      fields['Actually happened']=mailText(p.actual);
      fields['Additional details']=mailText(p.freetext || null);
    } else {
      fields['Idea type']=label(taxonomy.ideaKinds,p.ideaKind);
      fields['What it should do']=mailText(p.ask);
      fields['Why it matters']=mailText(p.why);
      fields['What success looks like']=mailText(p.doneLooksLike);
      fields['Importance']=label(taxonomy.importance,p.importance);
    }
    const context=p.ctx||{};
    for(const [key,title] of Object.entries({v:'App version',schema:'Data schema',build:'Build',mode:'Mode',theme:'Theme',ai:'AI setting',os:'Device OS',browser:'Browser',screen:'Screen category',lang:'Language'})) fields[title]=mailText(context[key]);
    fields['Follow-up answers']=(p.followups||[]).map(f=>`${careFollowupLabel(p,f)}: ${careAnswerLabel(p,f)}`).join('\n') || 'None yet';
    // Preserve every accepted original detail alongside the readable summary.
    fields['Original submitted details (complete)']=JSON.stringify(p,null,2);
  }
  fields['About this copy']='The submission remains in Customer Care. This email is an additional copy. Missing details are marked as not supplied; nothing is guessed.';
  return fields;
}
export function careEmailHtml(fields) {
  const escape=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  return '<!doctype html><html><body style="margin:0;background:#f5f3ee;font:16px Arial,sans-serif;color:#202020"><div style="max-width:720px;margin:auto;padding:24px"><h1 style="font-size:24px">RealmWright Customer Care</h1><p>A complete copy of the saved submission.</p><table style="border-collapse:collapse;width:100%;background:white">'+Object.entries(fields).filter(([key])=>!key.startsWith('_')).map(([key,value])=>'<tr><th style="text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid #ddd;width:30%">'+escape(key)+'</th><td style="padding:12px;border-bottom:1px solid #ddd;white-space:pre-wrap;word-break:break-word">'+escape(value)+'</td></tr>').join('')+'</table></div></body></html>';
}
export async function deliverCareMail(env,event) {
  if(!env.CARE_MAIL_API_KEY) throw new Error('Email sender needs one-time setup');
  const to=env.CARE_MAIL_TO,from=env.CARE_MAIL_FROM || to;
  if(!to || !from) throw new Error('Email destination is not configured');
  const fields=await composeCareMail(env,event);
  const message={sender:{name:'RealmWright Customer Care',email:from},to:[{email:to,name:'Hunter'}],subject:fields._subject,
    htmlContent:careEmailHtml(fields),textContent:Object.entries(fields).filter(([key])=>!key.startsWith('_')).map(([key,value])=>key+': '+value).join('\n\n'),
    tags:['realmwright-care'],headers:{'X-Care-Event':event.event_key}};
  const email=JSON.parse(event.snapshot).email;
  if(typeof email==='string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))message.replyTo={email};
  const res=await fetch('https://api.brevo.com/v3/smtp/email',{
    method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','api-key':env.CARE_MAIL_API_KEY},
    body:JSON.stringify(message),signal:AbortSignal.timeout(15000)
  });
  if(!res.ok) throw new Error('Email service returned HTTP '+res.status);
  const result=await res.json();
  if(typeof result.messageId!=='string' || !result.messageId) throw new Error('Email service has not confirmed acceptance');
  return result.messageId;
}
export async function drainCareMail(env) {
  if(env.CARE_MAIL_ENABLED!=='true') return;
  const now=Math.floor(Date.now()/1000);
  const {results}=await env.DB.prepare(`SELECT event_key FROM care_mail_outbox
    WHERE (state='pending' AND next_attempt_at<=?1) OR (state='sending' AND lease_until<?1)
    ORDER BY created_at,event_key LIMIT 3`).bind(now).all();
  await Promise.all(results.map(async ({event_key})=>{
    const lease=crypto.randomUUID();
    const row=await env.DB.prepare(`UPDATE care_mail_outbox SET state='sending',lease_token=?1,lease_until=?2,attempts=attempts+1
      WHERE event_key=?3 AND ((state='pending' AND next_attempt_at<=?4) OR (state='sending' AND lease_until<?4)) RETURNING *`)
      .bind(lease,now+120,event_key,now).first();
    if(!row)return;
    try {
      await deliverCareMail(env,row);
      await env.DB.prepare(`UPDATE care_mail_outbox SET state='accepted',accepted_at=?1,last_error=NULL,lease_token=NULL,lease_until=0
        WHERE event_key=?2 AND lease_token=?3`).bind(Math.floor(Date.now()/1000),event_key,lease).run();
    } catch(error) {
      const state=row.attempts>=12?'failed':'pending';
      const delay=Math.min(3600,60*2**Math.min(row.attempts,6));
      await env.DB.prepare(`UPDATE care_mail_outbox SET state=?1,next_attempt_at=?2,last_error=?3,lease_token=NULL,lease_until=0
        WHERE event_key=?4 AND lease_token=?5`).bind(state,now+delay,String(error.message||'Email temporarily unavailable').slice(0,180),event_key,lease).run();
    }
  }));
}

export function careContext(value,limit=120){return typeof value==='number' && Number.isFinite(value)?value:typeof value==='string'?(value.trim().slice(0,limit)||null):null;}
