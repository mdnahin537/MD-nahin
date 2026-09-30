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
    }`;
  const fragment=`
    precision mediump float;
    varying mediump vec3 v_normal;
    varying mediump vec3 v_world;
    varying mediump vec3 v_color;
    void main(){
      vec3 n=normalize(v_normal);
      vec3 light=normalize(vec3(-.7,1.1,1.5));
      vec3 view=normalize(vec3(0.,0.,5.5)-v_world);
      float diffuse=max(dot(n,light),0.);
      float shine=pow(max(dot(reflect(-light,n),view),0.),56.);
      float rim=pow(1.-max(dot(n,view),0.),3.);
      float cool=max(dot(n,normalize(vec3(.8,-.3,-1.))),0.);
      vec3 colour=v_color*(.22+diffuse*1.05)+vec3(1.,.81,.54)*shine*.95;
      colour+=vec3(.22,.34,.40)*cool*.28+vec3(.45,.25,.11)*rim*.45;
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
  function lantern(){
    const p=(1+Math.sqrt(5))/2;
    const vertices=[[-1,p,0],[1,p,0],[-1,-p,0],[1,-p,0],[0,-1,p],[0,1,p],[0,-1,-p],[0,1,-p],[p,0,-1],[p,0,1],[-p,0,-1],[-p,0,1]]
      .map(point=>normalize(point).map(value=>value*1.18));
    const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
    const data=[];
    faces.forEach((face,index)=>triangle(data,...face.map(i=>vertices[i]),[.57+.06*(index%3),.27+.025*(index%4),.11+.016*(index%5)]));
    return data;
  }
  function orbit(radius,tube,colour){
    const data=[],segments=72,sides=6;
    function sample(i,j){
      const angle=i/segments*Math.PI*2,around=j/sides*Math.PI*2;
      const distance=radius+tube*Math.cos(around);
      return {point:[distance*Math.cos(angle),distance*Math.sin(angle),tube*Math.sin(around)],
        normal:[Math.cos(around)*Math.cos(angle),Math.cos(around)*Math.sin(angle),Math.sin(around)]};
    }
    for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){
      const a=sample(i,j),b=sample(i+1,j),c=sample(i+1,j+1),d=sample(i,j+1);
      for(const vertex of [a,b,c,a,c,d])data.push(...vertex.point,...vertex.normal,...colour);
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
      for(const data of [lantern(),orbit(1.66,.023,[.43,.24,.12]),orbit(1.91,.033,[.37,.21,.10])]){
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
