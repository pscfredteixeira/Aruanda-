/* ARUANDA — Sprint 04: Ecos, Fragmentos de Memória, Essência Vital. */
(function(){
"use strict";
const KEY="aruanda:s04:resources:v1";
const TOTAL_MEMORIES=6,MAX_ESSENCE=3,HEAL_DELAY=560;
const FIXED=[
 // Fragmentos de Memória: 6 posições acessíveis com o pulo simples.
 {id:"mem-01",kind:"memory",x:242,y:594},
 {id:"mem-02",kind:"memory",x:386,y:536},
 {id:"mem-03",kind:"memory",x:572,y:486},
 {id:"mem-04",kind:"memory",x:758,y:428},
 {id:"mem-05",kind:"memory",x:946,y:478},
 {id:"mem-06",kind:"memory",x:1850,y:456},
 // Ecos e essências em caminhos visíveis, suficientes para o teste da sala.
 {id:"eco-01",kind:"eco",x:190,y:662,value:2},
 {id:"eco-02",kind:"eco",x:280,y:660,value:3},
 {id:"eco-03",kind:"eco",x:555,y:485,value:2},
 {id:"eco-04",kind:"eco",x:720,y:427,value:3},
 {id:"eco-05",kind:"eco",x:1114,y:657,value:3},
 {id:"eco-06",kind:"eco",x:1470,y:552,value:2},
 {id:"eco-07",kind:"eco",x:2040,y:512,value:4},
 {id:"vital-01",kind:"essence",x:105,y:660},
 {id:"vital-02",kind:"essence",x:1190,y:662},
 {id:"vital-03",kind:"essence",x:1870,y:457}
];
function fresh(){return {ecos:0,essence:0,memories:[],fixed:[]};}
function safeLoad(){
 let raw=null;try{raw=localStorage.getItem(KEY);}catch(_){}
 if(!raw)return fresh();
 try{
  const value=JSON.parse(raw);
  const ids=Array.isArray(value.memories)?value.memories.filter(x=>typeof x==="string"&&/^mem-0[1-6]$/.test(x)):[];
  const fixed=Array.isArray(value.fixed)?value.fixed.filter(x=>typeof x==="string"&&x.length<40):[];
  return {
   ecos:Math.min(999999,Math.max(0,Math.floor(Number(value.ecos)||0))),
   essence:Math.min(MAX_ESSENCE,Math.max(0,Math.floor(Number(value.essence)||0))),
   memories:[...new Set(ids)],fixed:[...new Set(fixed)]
  };
 }catch(_){return fresh();}
}
const progress=window.AruandaProgress||safeLoad();
window.AruandaProgress=progress;
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(progress));}catch(_){}
}
function createTextures(scene){
 const make=(id,w,h,draw)=>{
  if(scene.textures.exists(id))return;
  const g=scene.make.graphics({x:0,y:0},false);draw(g);g.generateTexture(id,w,h);g.destroy();
 };
 make("aruanda-eco",28,35,g=>{
  g.fillStyle(0xd5aa57,.25);g.fillCircle(14,21,13);
  g.fillStyle(0xe5c789);g.fillEllipse(14,21,15,18);
  g.fillTriangle(7,17,14,2,21,17);
  g.fillStyle(0xfff3c9);g.fillEllipse(11,18,6,9);
 });
 make("aruanda-memory",34,43,g=>{
  g.lineStyle(2,0x587d7a);
  g.fillStyle(0xa7dcd1);g.fillPoints([{x:17,y:0},{x:30,y:20},{x:19,y:42},{x:5,y:23}],true);
  g.fillStyle(0xe8f9eb);g.fillTriangle(17,4,25,19,16,21);
  g.fillStyle(0xf5e6ae);g.fillCircle(17,22,4);
  g.strokeCircle(17,22,7);
 });
 make("aruanda-essence",34,38,g=>{
  g.fillStyle(0x6a9d83,.25);g.fillCircle(17,19,17);
  g.fillStyle(0x8cdbc2);g.fillCircle(17,21,12);
  g.fillStyle(0xcaf6db);g.fillEllipse(12,17,6,10);
  g.fillStyle(0x527a56);g.fillEllipse(11,8,11,5);g.fillEllipse(24,8,10,5);
  g.lineStyle(2,0x365c4b);g.lineBetween(17,13,17,5);
 });
}
class InventorySystem{
 constructor(scene,solids,combat){
  this.scene=scene;this.solids=solids;this.combat=combat;
  this.healing=false;this.lastHealHeld=false;this.toastTimer=null;
  createTextures(scene);
  this.group=scene.physics.add.group();
  // Apenas itens versus plataformas: nunca bloquear o herói, que usa somente overlap.
  this.floorCollider=scene.physics.add.collider(this.group,solids);
  this.overlap=scene.physics.add.overlap(scene.hero,this.group,(hero,item)=>this.collect(item),null,scene);
  this.hud=[];
  const configure=(x,texture)=>{
   const image=scene.add.image(x,37,texture).setScrollFactor(0).setDepth(96).setScale(.62);
   this.hud.push(image);
  };
  configure(650,"aruanda-eco");
  configure(752,"aruanda-memory");
  configure(871,"aruanda-essence");
  const counter=(x)=>{
   const item=scene.add.text(x,27,"0",{
     fontFamily:"Arial,sans-serif",fontSize:"17px",fontStyle:"bold",color:"#fff1d8",
     backgroundColor:"#253d31cc",padding:{x:5,y:4}
   }).setScrollFactor(0).setDepth(96);
   this.hud.push(item);return item;
  };
  this.ecoCount=counter(669);
  this.memoryCount=counter(774);
  this.essenceCount=counter(891);
  this.toast=scene.add.text(480,84,"",{
    fontFamily:"Georgia,serif",fontSize:"18px",color:"#fff2d9",
    backgroundColor:"#253d31ee",padding:{x:12,y:7}
  }).setOrigin(.5,0).setScrollFactor(0).setDepth(99).setVisible(false);
  this.hud.push(this.toast);
  this.render();
  FIXED.forEach(p=>{
   if(p.kind==="memory"&&progress.memories.includes(p.id))return;
   if(progress.fixed.includes(p.id))return;
   this.spawn(p.kind,p.x,p.y,{id:p.id,value:p.value||1,fixed:true});
  });
  this.enemyListener=({type,x,y,killCount})=>this.enemyDefeated(type,x,y,killCount);
  scene.events.on("aruanda:enemy-defeated",this.enemyListener);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.cleanup());
 }
 spawn(kind,x,y,options={}){
  const texture="aruanda-"+kind;
  if(!this.scene.textures.exists(texture))return null;
  const item=this.group.create(x,y,texture);
  item.setDepth(16);
  item.setDataEnabled();
  item.setData("kind",kind);item.setData("id",options.id||null);
  item.setData("value",options.value||1);
  item.setData("fixed",!!options.fixed);
  item.setCircle(kind==="memory"?15:12);
  item.setCollideWorldBounds(true);
  if(options.fixed){
   item.body.setAllowGravity(false);item.setImmovable(true);
  }else{
   item.body.setGravityY(900);item.setBounce(.18);
   item.setVelocity(Phaser.Math.Between(-70,70),-155);
  }
  this.scene.tweens.add({targets:item,alpha:{from:1,to:.72},duration:900,yoyo:true,repeat:-1});
  return item;
 }
 collect(item){
  if(!item.active)return;
  const kind=item.getData("kind");
  const id=item.getData("id");
  const value=item.getData("value");
  if(kind==="memory"&&id&&progress.memories.includes(id)){item.destroy();return;}
  if(kind==="essence"&&progress.essence>=MAX_ESSENCE){return;}
  if(kind==="eco"){progress.ecos=Math.min(999999,progress.ecos+value);this.pop("+"+value+" Ecos",item.x,item.y,0xe8ca8b);}
  else if(kind==="memory"){
   if(id)progress.memories.push(id);
   this.pop("Memória encontrada  "+progress.memories.length+"/"+TOTAL_MEMORIES,item.x,item.y,0xa7eddb);
   this.announce("Fragmento de Memória  "+progress.memories.length+"/"+TOTAL_MEMORIES);
  }else if(kind==="essence"){
   progress.essence=Math.min(MAX_ESSENCE,progress.essence+1);
   this.pop("+1 Essência Vital",item.x,item.y,0x9ce3ad);
  }
  if(item.getData("fixed")&&id&&!progress.fixed.includes(id))progress.fixed.push(id);
  item.destroy();this.render();save();
 }
 enemyDefeated(type,x,y,killCount){
  if(!this.scene.sys.isActive())return;
  const total=type==="wisp"?2:1+(killCount%3);
  for(let i=0;i<total;i++)this.spawn("eco",x+i*10-total*5,y-10,{value:1});
  if(killCount%4===0)this.spawn("essence",x,y-22);
 }
 pop(text,x,y,color){
  const s=this.scene;
  const t=s.add.text(x,y-28,text,{fontFamily:"Arial,sans-serif",fontStyle:"bold",fontSize:"14px",
   color:"#fdf9ed",stroke:"#264338",strokeThickness:4}).setOrigin(.5).setDepth(99);
  t.setTint(color);
  s.tweens.add({targets:t,y:t.y-48,alpha:0,duration:850,ease:"Cubic.easeOut",onComplete:()=>t.destroy()});
 }
 announce(text){
  this.toast.setText(text).setVisible(true).setAlpha(1);
  if(this.toastTimer)this.toastTimer.remove(false);
  this.toastTimer=this.scene.time.delayedCall(1400,()=>this.toast?.setVisible(false));
 }
 render(){
  this.ecoCount.setText(String(progress.ecos));
  this.memoryCount.setText(progress.memories.length+"/"+TOTAL_MEMORIES);
  this.essenceCount.setText(progress.essence+"/"+MAX_ESSENCE);
 }
 healButton(held){
  const press=held&&!this.lastHealHeld;this.lastHealHeld=!!held;
  if(!press||this.healing||this.combat.dead)return;
  if(progress.essence===0){this.announce("Sem Essência Vital");return;}
  if(this.combat.hp>=window.AruandaCombat.SETTINGS.maxHP){
   this.announce("Vida completa");return;
  }
  this.healing=true;this.announce("Recuperando...");
  this.scene.time.delayedCall(HEAL_DELAY,()=>{
   this.healing=false;
   if(!this.scene.sys.isActive()||this.combat.dead||progress.essence<1)return;
   if(this.combat.hp>=window.AruandaCombat.SETTINGS.maxHP)return;
   progress.essence--;
   this.combat.hp=Math.min(window.AruandaCombat.SETTINGS.maxHP,this.combat.hp+1);
   this.combat.updateHud();this.render();save();
   this.announce("+1 vida recuperada");
  });
 }
 cleanup(){
  this.scene.events.off("aruanda:enemy-defeated",this.enemyListener);
  if(this.toastTimer)this.toastTimer.remove(false);
  this.floorCollider?.destroy();this.overlap?.destroy();
  this.hud.forEach(x=>x?.destroy());
  this.group?.clear(true,true);
 }
 getDebugLines(){
  return ["Ecos: "+progress.ecos,"Memórias: "+progress.memories.length+"/"+TOTAL_MEMORIES,
   "Essência: "+progress.essence+"/"+MAX_ESSENCE,"Curando: "+(this.healing?"SIM":"NÃO")];
 }
}
window.AruandaInventory={InventorySystem,PROGRESS:progress,FIXED,TOTAL_MEMORIES};
})();