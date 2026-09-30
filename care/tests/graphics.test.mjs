import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

function fixture(source, html, options={}) {
  const nodes=[], programs=[], calls={draws:0,buffers:[]}, frames=new Map(), timers=new Map(), storage=new Map(options.saved||[]);
  let clock=0, sequence=0;
  const eventTarget=object=>{
    const listeners=new Map();
    return Object.assign(object,{
      addEventListener(type,fn){const set=listeners.get(type)||new Set();set.add(fn);listeners.set(type,set);},
      removeEventListener(type,fn){listeners.get(type)?.delete(fn);},
      emit(type,event={}){for(const fn of [...(listeners.get(type)||[])])fn({...event,type,target:object,preventDefault(){}});}
    });
  };
  function matches(element, selector) {
    selector=selector.trim().split(/\s+/).at(-1);
    if(selector.startsWith('#'))return element.id===selector.slice(1);
    if(selector.startsWith('.'))return element.classList.contains(selector.slice(1));
    if(selector.startsWith('[')){
      const match=selector.match(/^\[([\w-]+)(?:=["']?([^"'\]]+)["']?)?\]$/);
      return match&&element.attributes.has(match[1])&&(match[2]===undefined||element.getAttribute(match[1])===match[2]);
    }
    return element.tagName?.toLowerCase()===selector;
  }
  function element(tag='div'){
    const classes=new Set(),attributes=new Map(),children=[];
    const node=eventTarget({tagName:tag.toUpperCase(),attributes,children,parentElement:null,dataset:{},hidden:false,
      style:{setProperty(name,value){this[name]=value;},removeProperty(name){delete this[name];}},
      classList:{add(...names){names.forEach(name=>classes.add(name));},remove(...names){names.forEach(name=>classes.delete(name));},
        contains(name){return classes.has(name);},toggle(name,force){const on=force??!classes.has(name);on?classes.add(name):classes.delete(name);return on;}},
      setAttribute(name,value){value=String(value);attributes.set(name,value);
        if(name==='id')this.id=value;
        if(name==='class'){classes.clear();value.split(/\s+/).filter(Boolean).forEach(name=>classes.add(name));}
        if(name==='hidden')this.hidden=true;
        if(name.startsWith('data-'))this.dataset[name.slice(5).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase())]=value;},
      getAttribute(name){return attributes.get(name)??null;},
      removeAttribute(name){attributes.delete(name);if(name==='hidden')this.hidden=false;},
      appendChild(child){children.push(child);child.parentElement=this;return child;},
      querySelectorAll(selector){const found=[];function visit(parent){for(const child of parent.children){if(selector.split(',').some(part=>matches(child,part)))found.push(child);visit(child);}}visit(this);return found;},
      querySelector(selector){return this.querySelectorAll(selector)[0]||null;},
      closest(selector){for(let node=this;node;node=node.parentElement)if(matches(node,selector))return node;return null;},
      getBoundingClientRect(){return {width:options.width||520,height:options.height||390,left:0,top:0,right:options.width||520,bottom:options.height||390};},
      clientWidth:options.width||520,clientHeight:options.height||390,offsetWidth:options.width||520,offsetHeight:options.height||390,
      textContent:'',focus(){document.activeElement=this;}
    });
    Object.defineProperty(node,'className',{get:()=>[...classes].join(' '),set:value=>node.setAttribute('class',value)});
    nodes.push(node);return node;
  }
  const root=element('html'),body=element('body');root.appendChild(body);
  const stack=[body];
  const voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  for(const token of html.matchAll(/<\/?([a-zA-Z][\w-]*)\b([^>]*)>/g)){
    const tag=token[1].toLowerCase();
    if(token[0].startsWith('</')){if(stack.length>1)stack.pop();continue;}
    if(tag==='html'||tag==='body'||tag==='head'||tag==='script'||tag==='style')continue;
    const node=element(tag);
    for(const attribute of token[2].matchAll(/([:\w-]+)(?:="([^"]*)"|='([^']*)')?/g))node.setAttribute(attribute[1],attribute[2]??attribute[3]??'');
    stack.at(-1).appendChild(node);
    if(!voidTags.has(tag)&&!token[0].endsWith('/>'))stack.push(node);
  }
  const document=eventTarget({documentElement:root,body,readyState:'complete',hidden:false,visibilityState:'visible',
    querySelector:selector=>nodes.find(node=>matches(node,selector))||null,
    querySelectorAll:selector=>nodes.filter(node=>matches(node,selector)),
    getElementById:id=>nodes.find(node=>node.id===id)||null,createElement:element});
  const constants={VERTEX_SHADER:0x8B31,FRAGMENT_SHADER:0x8B30,COMPILE_STATUS:0x8B81,LINK_STATUS:0x8B82,
    ARRAY_BUFFER:0x8892,ELEMENT_ARRAY_BUFFER:0x8893,STATIC_DRAW:0x88E4,DYNAMIC_DRAW:0x88E8,FLOAT:0x1406,
    TRIANGLES:4,LINES:1,LINE_STRIP:3,POINTS:0,DEPTH_TEST:0x0B71,BLEND:0x0BE2,CULL_FACE:0x0B44,
    SRC_ALPHA:0x0302,ONE_MINUS_SRC_ALPHA:0x0303,COLOR_BUFFER_BIT:0x4000,DEPTH_BUFFER_BIT:0x0100,UNSIGNED_SHORT:0x1403,
    NO_ERROR:0,HIGH_FLOAT:0x8DF2,MAX_RENDERBUFFER_SIZE:0x84E8,MAX_TEXTURE_SIZE:0x0D33};
  const gl=new Proxy({...constants,
    createShader:type=>({type}),shaderSource(shader,source){shader.source=source;},
    getShaderParameter:()=>!options.shaderFailure,getShaderInfoLog:()=>options.shaderFailure?'Isolated shader failure':'',
    createProgram(){const program={shaders:[]};programs.push(program);return program;},
    attachShader(program,shader){program.shaders.push(shader);},getProgramParameter:()=>!options.linkFailure,
    getProgramInfoLog:()=>options.linkFailure?'Isolated link failure':'',
    createBuffer:()=>options.bufferFailure?null:({}),bufferData(target,data){if(ArrayBuffer.isView(data))calls.buffers.push(Array.from(data));},
    getAttribLocation:()=>0,getUniformLocation:(_,name)=>({name}),
    getShaderPrecisionFormat:()=>({precision:23,rangeMin:127,rangeMax:127}),
    getParameter:()=>4096,getExtension:()=>null,isContextLost:()=>!!options.contextLost,getError:()=>options.drawFailure&&calls.draws>0?0x0502:0,
    drawArrays(){calls.draws++;},drawElements(){calls.draws++;}
  },{get(target,name){return name in target?target[name]:()=>{};}});
  for(const canvas of nodes.filter(node=>node.tagName==='CANVAS'))canvas.getContext=()=>options.noGL?null:gl;
  const reduced=eventTarget({matches:!!options.reduced}),light=eventTarget({matches:!!options.light}),fine=eventTarget({matches:true});
  const observers=[];
  class IntersectionObserver{
    constructor(callback){this.callback=callback;this.active=true;observers.push(this);}
    observe(target){this.target=target;}unobserve(){}disconnect(){this.active=false;}
  }
  class ResizeObserver{constructor(callback){this.callback=callback;}observe(){}disconnect(){}}
  const context=eventTarget({document,console,Math,Date,Float32Array,Uint16Array,ArrayBuffer,
    performance:{now:()=>clock},devicePixelRatio:options.dpr||2,innerWidth:options.width||1024,innerHeight:800,
    navigator:{connection:{saveData:!!options.saveData},hardwareConcurrency:4},
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value))},
    sessionStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value))},
    matchMedia(query){return query.includes('reduced-motion')?reduced:query.includes('color-scheme')?light:fine;},
    getComputedStyle(){return {getPropertyValue(name){return {'--surface':'#12151b','--ink':'#f3eadc','--accent':'#f5ce9e','--accent-strong':'#efb16d'}[name]||'';}};},
    requestAnimationFrame(fn){const id=++sequence;frames.set(id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);},
    requestIdleCallback(fn){const id=++sequence;timers.set(id,fn);return id;},cancelIdleCallback(id){timers.delete(id);},
    setTimeout(fn){const id=++sequence;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);},
    IntersectionObserver,ResizeObserver
  });
  context.window=context;document.defaultView=context;
  vm.createContext(context);vm.runInContext(source,context);
  const fixture={context,document,nodes,gl,calls,frames,storage,reduced,light,programs,
    flush(){const pending=[...timers.values()];timers.clear();for(const fn of pending)fn({timeRemaining:()=>20,didTimeout:false});},
    step(milliseconds=40){clock+=milliseconds;const pending=[...frames.values()];frames.clear();for(const fn of pending)fn(clock);},
    intersect(visible){for(const observer of observers.filter(item=>item.active))observer.callback([{target:observer.target,isIntersecting:visible,intersectionRatio:visible?1:0}]);},
    visibility(hidden){document.hidden=hidden;document.visibilityState=hidden?'hidden':'visible';document.emit('visibilitychange');},
    shaders(){return programs.filter(program=>program.shaders.length===2).map(program=>({
      vertex:program.shaders.find(shader=>shader.type===constants.VERTEX_SHADER).source,
      fragment:program.shaders.find(shader=>shader.type===constants.FRAGMENT_SHADER).source}));}
  };
  fixture.flush();return fixture;
}

const source=readFileSync(new URL('../public/js/care-scene.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
function scene(options={}){
  const f=fixture(source,html,options);
  f.document.emit('DOMContentLoaded');f.flush();f.intersect(true);f.flush();f.step();f.step();
  return f;
}
function hero(f){return f.document.querySelector('[data-care-hero]');}
function toggle(f){return f.document.querySelector('[data-care-motion-toggle]');}

test('Production 3D shaders compile and link in native GLES without a browser',
  {skip:process.env.CARE_VALIDATE_NATIVE_SHADERS!=='1'},()=>{
  const f=scene();
  const programs=f.shaders();
  assert.ok(programs.length>0,'The actual scene must supply shader programs');
  const result=spawnSync('python3',[new URL('compile_graphics_shaders.py',import.meta.url).pathname],{
    encoding:'utf8',input:JSON.stringify({programs}),timeout:30000,
    env:{...process.env,LIBGL_ALWAYS_SOFTWARE:'1'}
  });
  assert.equal(result.status,0,result.stderr||result.stdout);
  const native=JSON.parse(result.stdout);
  assert.equal(native.compilation,'passed');assert.equal(native.linking,'passed');
  const numbers=f.calls.buffers.flat();
  assert.ok(numbers.length>0,'Actual scene geometry must be uploaded');
  assert.ok(numbers.every(Number.isFinite),'Mesh coordinates and normals must be finite');
  mkdirSync(new URL('../test-results/',import.meta.url),{recursive:true});
  writeFileSync(new URL('../test-results/graphics-shaders.json',import.meta.url),JSON.stringify(native,null,2));
});
test('Pause stops 3D and ambient motion and is restored after reload',()=>{
  const f=scene();
  assert.ok(f.calls.draws>0,'A visible scene renders');
  assert.equal(hero(f).dataset.careMotion,'running');
  toggle(f).emit('click');f.flush();
  assert.equal(hero(f).dataset.careMotion,'still');
  const before=f.calls.draws;f.step();f.step();
  assert.equal(f.calls.draws,before);assert.equal(f.frames.size,0);
  const reloaded=scene({saved:[...f.storage]});
  assert.equal(hero(reloaded).dataset.careMotion,'still');assert.equal(reloaded.frames.size,0);
  toggle(f).emit('click');f.flush();f.step();f.step();
  assert.equal(hero(f).dataset.careMotion,'running');assert.ok(f.calls.draws>before);
});
test('Reduced motion retains a usable static scene without an animation loop',()=>{
  const f=scene({reduced:true});
  assert.equal(hero(f).dataset.careMotion,'still');assert.equal(f.frames.size,0);
  const before=f.calls.draws;f.step();f.step();assert.equal(f.calls.draws,before);
  assert.ok(f.document.querySelector('[data-care-scene]').querySelector('img'),'Static artwork remains available');
});
test('Hidden and offscreen scenes stop work and resume one animation loop',()=>{
  const f=scene();
  f.visibility(true);f.flush();
  const before=f.calls.draws;f.step();f.step();
  assert.equal(f.calls.draws,before);assert.equal(f.frames.size,0);
  f.visibility(false);f.flush();f.step();f.step();
  assert.ok(f.calls.draws>before);assert.ok(f.frames.size<=1);
  f.intersect(false);f.flush();
  const offscreen=f.calls.draws;f.step();f.step();
  assert.equal(f.calls.draws,offscreen);assert.equal(f.frames.size,0);
  f.intersect(true);f.flush();f.step();f.step();
  assert.ok(f.calls.draws>offscreen);assert.ok(f.frames.size<=1);
});
test('Graphics initialization failure keeps the static artwork and core page intact',()=>{
  for(const options of [{noGL:true},{shaderFailure:true},{linkFailure:true},{bufferFailure:true},{drawFailure:true},{contextLost:true}]){
    const f=scene(options);
    assert.ok(f.document.getElementById('board-title'));
    assert.ok(f.document.querySelector('[data-care-scene]').querySelector('img'));
    assert.equal(f.document.querySelector('[data-care-scene]').classList.contains('is-rendered'),false);
    assert.equal(f.frames.size,0);
  }
});
test('Graphics context loss returns to the static scene and stops motion',()=>{
  const f=scene();
  const canvas=f.document.querySelector('[data-care-scene]').querySelector('canvas');
  canvas.emit('webglcontextlost');f.flush();
  assert.equal(f.document.querySelector('[data-care-scene]').classList.contains('is-rendered'),false);
  assert.equal(f.frames.size,0);assert.equal(hero(f).dataset.careMotion,'still');
});
