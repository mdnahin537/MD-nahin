// Decorative 3D only. The board, identity and customer submissions are independent.
(() => {
  'use strict';
  const hero=document.querySelector('[data-care-hero]');
  if(!hero)return;
  const scene=hero.querySelector('[data-care-scene]');
  const canvas=scene?.querySelector('canvas');
  const button=hero.querySelector('[data-care-motion-toggle]');
  const label=button?.querySelector('[data-care-motion-label]');
  if(!scene||!canvas||!button||!label)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const preference='rw_care_decorative_motion';
  let paused=false;
  try{paused=localStorage.getItem(preference)==='paused';}catch{}
  let visible=!('IntersectionObserver' in window),hidden=document.hidden,ready=false;
  let frame=0,lastDraw=0,previous=0,seconds=0,gl,program,meshes=[],shaders=[],locations;
  let pointerX=0,pointerY=0;
  const vertex=`
    precision highp float;
    attribute vec3 a_position;
    attribute vec3 a_normal;
    attribute vec3 a_color;
    uniform vec3 u_rotation;
    uniform float u_aspect;
    varying mediump vec3 v_normal;
    varying mediump vec3 v_world;
    varying mediump vec3 v_color;
    varying mediump vec3 v_local;
    varying mediump vec3 v_localNormal;
    varying mediump vec3 v_tangent;
    varying mediump vec3 v_bitangent;
    void main(){
      vec3 c=cos(u_rotation),s=sin(u_rotation);
      mat3 x=mat3(1.,0.,0.,0.,c.x,s.x,0.,-s.x,c.x);
      mat3 y=mat3(c.y,0.,-s.y,0.,1.,0.,s.y,0.,c.y);
      mat3 z=mat3(c.z,s.z,0.,-s.z,c.z,0.,0.,0.,1.);
      mat3 rotation=z*y*x;
      vec3 world=rotation*a_position;
      float depth=5.5-world.z;
      gl_Position=vec4(world.x*2.5/u_aspect,world.y*2.5,1.002*depth-.2002,depth);
      v_normal=rotation*a_normal;v_world=world;v_color=a_color;
      vec3 axis=abs(a_normal.z)<.95?vec3(0.,0.,1.):vec3(0.,1.,0.);
      vec3 tangent=normalize(cross(axis,a_normal));
      v_tangent=rotation*tangent;v_bitangent=rotation*cross(a_normal,tangent);
      v_local=a_position;v_localNormal=a_normal;
    }`;
  const fragment=`
    precision mediump float;
    varying mediump vec3 v_normal;
    varying mediump vec3 v_world;
    varying mediump vec3 v_color;
    varying mediump vec3 v_local;
    varying mediump vec3 v_localNormal;
    varying mediump vec3 v_tangent;
    varying mediump vec3 v_bitangent;
    float surfaceHash(vec3 p){
      return fract(sin(dot(p,vec3(7.127,13.617,17.913)))*13.57);
    }
    float metalSurface(vec3 point){
      vec3 p=point*24.,cell=floor(p),f=fract(p);
      f=f*f*(3.-2.*f);
      float a=mix(surfaceHash(cell),surfaceHash(cell+vec3(1.,0.,0.)),f.x);
      float b=mix(surfaceHash(cell+vec3(0.,1.,0.)),surfaceHash(cell+vec3(1.,1.,0.)),f.x);
      float c=mix(surfaceHash(cell+vec3(0.,0.,1.)),surfaceHash(cell+vec3(1.,0.,1.)),f.x);
      float d=mix(surfaceHash(cell+vec3(0.,1.,1.)),surfaceHash(cell+vec3(1.,1.,1.)),f.x);
      return mix(mix(a,b,f.y),mix(c,d,f.y),f.z);
    }
    void main(){
      vec3 localNormal=normalize(v_localNormal);
      vec3 axis=abs(localNormal.z)<.95?vec3(0.,0.,1.):vec3(0.,1.,0.);
      vec3 tangent=normalize(cross(axis,localNormal)),bitangent=cross(localNormal,tangent);
      float grain=metalSurface(v_local),eps=.014;
      float dx=(metalSurface(v_local+tangent*eps)-grain)/eps;
      float dy=(metalSurface(v_local+bitangent*eps)-grain)/eps;
      vec3 n=normalize(v_normal-v_tangent*dx*.008-v_bitangent*dy*.008);
      vec3 light=normalize(vec3(-.7,1.1,1.5));
      vec3 view=normalize(vec3(0.,0.,5.5)-v_world);
      float diffuse=max(dot(n,light),0.);
      float shine=pow(max(dot(reflect(-light,n),view),0.),28.);
      float edge=pow(max(dot(reflect(-light,n),view),0.),96.);
      float rim=pow(1.-max(dot(n,view),0.),3.);
      float cool=max(dot(n,normalize(vec3(.8,-.3,-1.))),0.);
      vec3 reflection=reflect(-view,n);
      float softbox=pow(max(dot(reflection,normalize(vec3(.5,-.9,-.1))),0.),9.);
      vec3 colour=v_color*(.14+diffuse*.78+(grain-.5)*.016);
      colour+=vec3(.95,.73,.42)*softbox*.18;
      colour+=vec3(1.,.76,.40)*shine*.54+vec3(1.,.88,.65)*edge*.62;
      colour+=vec3(.22,.34,.40)*cool*.11+vec3(.45,.25,.11)*rim*.35;
      colour=colour/(colour+vec3(.65));
      gl_FragColor=vec4(pow(colour,vec3(1./2.2)),1.);
    }`;
  const normalize=v=>{const length=Math.hypot(...v)||1;return v.map(value=>value/length);};
  function triangle(data,a,b,c,colour){
    const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);
    let normal=normalize([u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]);
    if(normal.reduce((sum,value,i)=>sum+value*(a[i]+b[i]+c[i]),0)<0)normal=normal.map(value=>-value);
    for(const point of [a,b,c])data.push(...point,...normal,...colour);
  }
  // Celestial inlays and punched bands are real relief in the existing meshes.
  function lantern(){
    const p=(1+Math.sqrt(5))/2;
    const vertices=[[-1,p,0],[1,p,0],[-1,-p,0],[1,-p,0],[0,-1,p],[0,1,p],[0,-1,-p],[0,1,-p],[p,0,-1],[p,0,1],[-p,0,-1],[-p,0,1]]
      .map(point=>normalize(point).map(value=>value*1.18));
    const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
    const data=[],gold=[.82,.535,.225],edgeGold=[.66,.365,.125],shadow=[.30,.135,.056];
    const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    function disc(point,radius,at){
      const segments=radius>.1?24:10;
      for(let i=0;i<segments;i++){
        const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;
        const ring=(angle,r,z)=>at(point[0]+Math.cos(angle)*r,point[1]+Math.sin(angle)*r,z);
        const outerA=ring(a,radius*1.05,.012),outerB=ring(b,radius*1.05,.012);
        const topA=ring(a,radius,.031),topB=ring(b,radius,.031);
        triangle(data,outerA,outerB,topB,edgeGold);triangle(data,outerA,topB,topA,edgeGold);
        triangle(data,at(...point,.031),topA,topB,gold);
      }
    }
    function crescent(at){
      const segments=24,radius=.205,offset=.105,inner=.197;
      const ix=(radius*radius-inner*inner+offset*offset)/(2*offset);
      const outerAngle=Math.acos(ix/radius),innerAngle=Math.acos((ix-offset)/inner);
      const curve=(i)=>{
        const t=i/segments,outer=outerAngle+(Math.PI*2-outerAngle*2)*t,inside=innerAngle+(Math.PI*2-innerAngle*2)*t;
        return [[radius*Math.cos(outer),radius*Math.sin(outer)],[offset+inner*Math.cos(inside),inner*Math.sin(inside)]];
      };
      for(let i=0;i<segments;i++){
        const [a,d]=curve(i),[b,c]=curve(i+1);
        const top=q=>at(q[0],q[1],.029),base=q=>at(q[0],q[1],.012);
        if(i!==0)triangle(data,top(a),top(b),top(d),gold);
        if(i!==segments-1)triangle(data,top(b),top(c),top(d),gold);
        triangle(data,base(a),base(b),top(b),edgeGold);triangle(data,base(a),top(b),top(a),edgeGold);
        triangle(data,base(d),top(d),top(c),edgeGold);triangle(data,base(d),top(c),base(c),edgeGold);
      }
    }
    function hammeredPanel(panel,normal,colour){
      const divisions=6;
      const at=(u,v)=>{
        const edge=Math.min(u,v,divisions-u-v);
        const dent=edge>0?-.006*(.5+.5*Math.sin(u*13.7+v*7.1)) : 0;
        return panel[0].map((value,i)=>value+(panel[1][i]-value)*u/divisions+(panel[2][i]-value)*v/divisions+normal[i]*dent);
      };
      for(let u=0;u<divisions;u++)for(let v=0;v<divisions-u;v++){
        const a=at(u,v),b=at(u+1,v),c=at(u,v+1);
        triangle(data,a,b,c,colour);
        if(v<divisions-u-1)triangle(data,b,at(u+1,v+1),c,colour);
      }
    }
    faces.forEach((face,index)=>{
      const corners=face.map(i=>vertices[i]);
      const centre=corners[0].map((_,i)=>corners.reduce((sum,point)=>sum+point[i],0)/3);
      const normal=normalize(centre);
      const panel=corners.map(point=>point.map((value,i)=>value*.89+centre[i]*.11-normal[i]*.018));
      const tone=index%3,copper=[.59+tone*.018,.285+tone*.009,.12+tone*.006];
      for(let i=0;i<3;i++){
        const j=(i+1)%3;
        triangle(data,corners[i],corners[j],panel[j],[.66,.35,.16]);
        triangle(data,corners[i],panel[j],panel[i],[.58,.28,.11]);
      }
      const sun=index===6||index===13,moon=index===15||index===8,stars=index===1||index===12;
      if(sun||moon||stars){
        hammeredPanel(panel,normal,[.23,.102,.043]);
        const axis=Math.abs(normal[0])>.9?[0,1,0]:[1,0,0];
        const u=normalize(axis.map((value,i)=>value-normal[i]*axis.reduce((sum,value,j)=>sum+value*normal[j],0))),v=cross(normal,u);
        const origin=centre.map((value,i)=>value-normal[i]*.018);
        const at=(x,y,z)=>origin.map((value,i)=>value+u[i]*x+v[i]*y+normal[i]*z);
        if(sun)disc([0,0],.196,at);
        if(moon)crescent(at);
        if(stars)for(const [x,y,r]of [[-.11,.09,.036],[0,.135,.03],[.105,.07,.038],[-.07,-.015,.025],[.035,-.025,.031],[-.055,-.12,.025],[.10,-.12,.023]])disc([x,y],r,at);
      }else if(index%4===0){
        const panelCentre=centre.map((value,i)=>value-normal[i]*.018);
        const inner=panel.map(point=>point.map((value,i)=>value*.68+panelCentre[i]*.32));
        const inset=panel.map(point=>point.map((value,i)=>value*.65+panelCentre[i]*.35));
        for(let i=0;i<3;i++){
          const j=(i+1)%3;
          triangle(data,panel[i],panel[j],inner[j],copper);triangle(data,panel[i],inner[j],inner[i],copper);
          triangle(data,inner[i],inner[j],inset[j],shadow);triangle(data,inner[i],inset[j],inset[i],shadow);
        }
        triangle(data,...inset,copper);
      }else triangle(data,...panel,copper);
    });
    return data;
  }
  function orbit(radius,tube,colour){
    const data=[],segments=72,width=tube*2.25,height=.029,bevel=.012;
    const profile=[[-width,-height+bevel],[-width+bevel,-height],[width-bevel,-height],[width,-height+bevel],[width,height-bevel],[width-bevel,height],[-width+bevel,height],[-width,height-bevel]];
    const point=(u,r,z)=>{const angle=u/segments*Math.PI*2;return[(radius+r)*Math.cos(angle),(radius+r)*Math.sin(angle),z];};
    function face(points,normal,material){
      for(const [u,r,z]of points){const angle=u/segments*Math.PI*2;data.push(...point(u,r,z),normal[0]*Math.cos(angle),normal[0]*Math.sin(angle),normal[1],...material);}
    }
    function chasedPanel(i){
      const stops=[0,.12,.24,.42,.54,.72,.84,1],half=width-bevel;
      for(let k=0;k<stops.length-1;k++){
        const a=i+stops[k],b=i+stops[k+1];
        const material=k%2===1?[.255,.113,.036]:colour;
        face([[a,-half,height],[b,-half,height],[b,half,height],[a,-half,height],[b,half,height],[a,half,height]],[0,1],material);
      }
    }
    function punchedPanel(i){
      const half=width-bevel,arc=radius*Math.PI*2/segments,hole=.027,well=.019;
      const angles=Array.from({length:12},(_,k)=>k*Math.PI/6);
      const corner=Math.atan2(half,arc/2);
      angles.push(corner,Math.PI-corner,Math.PI+corner,Math.PI*2-corner);angles.sort((a,b)=>a-b);
      const sample=(angle,outer=false)=>{
        const x=Math.cos(angle),y=Math.sin(angle);
        const r=outer?Math.min((arc/2)/Math.max(Math.abs(x),1e-9),half/Math.max(Math.abs(y),1e-9)):hole;
        return[i+.5+x*r/arc,y*r,height];
      };
      for(let k=0;k<angles.length;k++){
        const a=sample(angles[k],true),b=sample(angles[(k+1)%angles.length],true),c=sample(angles[(k+1)%angles.length]),d=sample(angles[k]);
        face([a,b,c,a,c,d],[0,1],colour);
        const lower=q=>[q[0],q[1]*well/hole,height-.018];
        const c0=lower(c),d0=lower(d);
        triangle(data,point(...d),point(...c),point(...c0),colour.map(x=>x*.82));
        triangle(data,point(...d),point(...c0),point(...d0),colour.map(x=>x*.82));
        triangle(data,point(i+.5,0,height-.018),point(...d0),point(...c0),[.19,.078,.026]);
      }
    }
    for(let i=0;i<segments;i++)for(let j=0;j<profile.length;j++){
      if(j===5&&i%12===0){punchedPanel(i);continue;}
      if(j===5&&i%12===6){chasedPanel(i);continue;}
      const [r,z]=profile[j],[r1,z1]=profile[(j+1)%profile.length];
      const length=Math.hypot(r1-r,z1-z),normal=[(z1-z)/length,-(r1-r)/length];
      const inlay=(j===4||j===6)&&(i%18<5);
      const material=inlay?[.69,.415,.175]:colour.map(x=>x*((j===4||j===6)?1.22:1));
      face([[i,r,z],[i+1,r,z],[i+1,r1,z1],[i,r,z],[i+1,r1,z1],[i,r1,z1]],normal,material);
    }
    return data;
  }
  function shader(kind,source){
    const shader=gl.createShader(kind);
    if(!shader)throw new Error('Graphics unavailable');
    gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw new Error('Graphics unavailable');}
    shaders.push(shader);return shader;
  }
  function dispose(){
    if(gl){
      for(const mesh of meshes)gl.deleteBuffer(mesh.buffer);
      for(const shader of shaders)gl.deleteShader(shader);
      if(program)gl.deleteProgram(program);
    }
    meshes=[];shaders=[];program=null;
  }
  function initialise(){
    if(ready)return;
    try{
      gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,powerPreference:'low-power'});
      if(!gl)throw new Error('Graphics unavailable');
      const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
      program=gl.createProgram();
      if(!program)throw new Error('Graphics unavailable');
      gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      gl.deleteShader(vs);gl.deleteShader(fs);shaders=[];
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Graphics unavailable');
      locations={
        position:gl.getAttribLocation(program,'a_position'),normal:gl.getAttribLocation(program,'a_normal'),colour:gl.getAttribLocation(program,'a_color'),
        rotation:gl.getUniformLocation(program,'u_rotation'),aspect:gl.getUniformLocation(program,'u_aspect')
      };
      for(const data of [lantern(),orbit(1.66,.036,[.46,.265,.13]),orbit(1.91,.043,[.40,.235,.115])]){
        const buffer=gl.createBuffer();
        if(!buffer)throw new Error('Graphics unavailable');
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
        meshes.push({buffer,count:data.length/9});
      }
      gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);ready=true;
      size();draw();
      if(gl.isContextLost()||gl.getError()!==gl.NO_ERROR)throw new Error('Graphics unavailable');
      scene.classList.add('is-rendered');sync();
    }catch{dispose();ready=false;scene.classList.remove('is-rendered');stop();button.hidden=true;hero.dataset.careMotion='still';}
  }
  function size(){
    if(!ready)return;
    const bounds=scene.getBoundingClientRect();
    const ratio=Math.min(window.devicePixelRatio||1,1.5,960/Math.max(bounds.width,1));
    canvas.width=Math.max(1,Math.round(bounds.width*ratio));
    canvas.height=Math.max(1,Math.round(bounds.height*ratio));
    gl.viewport(0,0,canvas.width,canvas.height);
  }
  function draw(){
    if(!ready)return;
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
    gl.uniform1f(locations.aspect,canvas.width/canvas.height);
    const turns=[[.19+pointerY,seconds*.09+pointerX,-.13],[.95,seconds*.06,-.16],[.36,-seconds*.045,.57]];
    meshes.forEach((mesh,index)=>{
      gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
      for(const [location,offset] of [[locations.position,0],[locations.normal,12],[locations.colour,24]]){
        gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,36,offset);
      }
      gl.uniform3f(locations.rotation,...turns[index]);gl.drawArrays(gl.TRIANGLES,0,mesh.count);
    });
  }
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;previous=0;lastDraw=0;}
  function running(){return ready&&visible&&!hidden&&!paused&&!reduced.matches;}
  function tick(now){
    frame=0;if(!running())return;
    if(!lastDraw||now-lastDraw>=1000/30){
      if(previous)seconds+=Math.min((now-previous)/1000,.06);
      previous=now;lastDraw=now;
      try{draw();}catch{fallback();return;}
    }
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    const active=running();
    hero.dataset.careMotion=active?'running':'still';
    button.hidden=!ready||reduced.matches;
    button.setAttribute('aria-pressed',String(paused));
    button.setAttribute('aria-label',paused?'Resume decorative motion':'Pause decorative motion');
    label.textContent=paused?'Resume motion':'Pause motion';
    if(active&&!frame)frame=requestAnimationFrame(tick);
    if(!active)stop();
  }
  function fallback(){
    stop();ready=false;scene.classList.remove('is-rendered');hero.dataset.careMotion='still';button.hidden=true;
  }
  button.addEventListener('click',()=>{
    paused=!paused;
    try{localStorage.setItem(preference,paused?'paused':'running');}catch{}
    sync();
  });
  scene.addEventListener('pointermove',event=>{
    if(!running()||event.pointerType==='touch')return;
    const bounds=scene.getBoundingClientRect();
    pointerX=Math.max(-.12,Math.min(.12,(event.clientX-bounds.left)/bounds.width*.24-.12));
    pointerY=Math.max(-.08,Math.min(.08,(event.clientY-bounds.top)/bounds.height*.16-.08));
  });
  scene.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
  document.addEventListener('visibilitychange',()=>{hidden=document.hidden;sync();});
  reduced.addEventListener?.('change',()=>{sync();if(ready&&!running())draw();});
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      visible=entries.some(entry=>entry.isIntersecting);
      if(visible&&!ready)initialise();
      sync();
    },{threshold:.02});
    observer.observe(hero);
  }else initialise();
  if('ResizeObserver' in window)new ResizeObserver(()=>{size();if(ready&&!running())draw();}).observe(scene);
  else window.addEventListener('resize',()=>{size();if(ready&&!running())draw();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
  canvas.addEventListener('webglcontextrestored',()=>{dispose();initialise();});
  window.addEventListener('pagehide',event=>{hidden=true;sync();if(!event.persisted){dispose();fallback();}});
  window.addEventListener('pageshow',()=>{hidden=document.hidden;if(!ready&&visible)initialise();sync();});
  hero.dataset.careMotion='still';
})();
