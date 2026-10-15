/* ARUANDA — Sprint 03. Movimentação original preservada; suporte a ataques aéreos. */
(function(){
"use strict";
var Phaser=window.Phaser;
var host=document.getElementById("game-container");
var status=document.getElementById("status");
if(!Phaser){if(status)status.textContent="Phaser não carregado.";return;}
if(status)status.remove();

var W=960,H=540;
var WORLD={width:2440,height:980};
var MOVE={
 speed:220,groundAccel:1800,groundDecel:2200,airAccel:1200,airDecel:1100,
 gravity:1200,maxFall:900,jump:-420,jumpCut:0.40,coyote:0.12,buffer:0.12,deadzone:0.22
};
var START={x:130,y:610};
var PLATFORMS=[
 [0,695,440,285],[532,695,450,285],[1065,695,470,285],[1640,695,800,285],
 [170,632,118,18],[328,575,132,18],[510,524,148,18],[682,468,156,18],
 [875,515,172,18],[1065,570,156,18],[1265,624,140,18],[1418,591,148,18],
 [1600,544,144,18],[1780,496,152,18],[1960,550,180,18],[2185,611,156,18]
];
function approach(current,target,step){if(current<target)return Math.min(current+step,target);if(current>target)return Math.max(current-step,target);return target;}
function label(scene,x,y,value,size,color){
 return scene.add.text(x,y,value,{fontFamily:"Georgia,serif",fontSize:size+"px",color:color||"#253e31",align:"center"});
}
function makeHero(scene){
 if(scene.textures.exists("hero"))return;
 var g=scene.make.graphics({x:0,y:0},false);
 g.fillStyle(0x654631);g.fillRoundedRect(17,48,10,25,4);g.fillRoundedRect(34,48,10,25,4);
 g.fillStyle(0x514235);g.fillRoundedRect(16,48,32,15,5);
 g.fillStyle(0xece0bd);g.fillPoints([{x:22,y:31},{x:43,y:31},{x:51,y:53},{x:15,y:53}],true);
 g.fillStyle(0xb39973);g.fillEllipse(32,51,22,5);
 g.lineStyle(5,0x67492f);g.lineBetween(51,20,49,72);
 g.lineStyle(3,0xa78554);g.lineBetween(51,20,46,12);g.lineBetween(52,23,57,15);
 g.fillStyle(0x815234);g.fillCircle(26,28,18);
 g.fillStyle(0x28201b);
 [[14,15,6],[22,11,8],[31,12,8],[39,18,7],[12,25,6],[28,7,5]].forEach(function(p){g.fillCircle(p[0],p[1],p[2]);});
 g.fillStyle(0xfff2dd);g.fillCircle(31,30,4.7);
 g.fillStyle(0x2e251e);g.fillCircle(33,30,2.4);
 g.generateTexture("hero",62,80);g.destroy();
}
class Title extends Phaser.Scene{
 constructor(){super("Title");}
 create(){
   this.cameras.main.setBackgroundColor("#e9dec2");
   var gfx=this.add.graphics();
   gfx.fillStyle(0xb7c7b6);gfx.fillCircle(480,260,300);
   gfx.fillStyle(0x889e8b,.23);
   [[160,340,290],[760,365,290],[440,410,380]].forEach(function(p){gfx.fillEllipse(p[0],p[1],p[2],105);});
   gfx.lineStyle(16,0xc8aa74,.35);gfx.strokeCircle(480,250,128);
   label(this,480,76,"A R U A N D A",59,"#2c4539").setOrigin(.5,0);
   label(this,480,161,"UM ESPÍRITO. MUITOS CAMINHOS.",17,"#5c6658").setOrigin(.5,0);
   label(this,480,225,"Prévia jogável • Combate aéreo",24,"#30493c").setOrigin(.5,0);
   label(this,480,274,"Explore as plataformas e enfrente espíritos no chão e no ar.",17,"#536456").setOrigin(.5,0);
   var bg=this.add.rectangle(480,381,360,65,0x304c3d).setInteractive({useHandCursor:true});
   label(this,480,381,"JOGAR SALA DE TESTE",21,"#fff4dc").setOrigin(.5);
   bg.on("pointerdown",()=>this.scene.start("Training"));
   label(this,480,466,"ENTER  ·  ESPAÇO  ·  CLIQUE",13,"#667363").setOrigin(.5);
   var kb=this.input.keyboard;
   if(kb){
     var begin=()=>this.scene.start("Training");
     kb.on("keydown-ENTER",begin);kb.on("keydown-SPACE",begin);
     this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{kb.off("keydown-ENTER",begin);kb.off("keydown-SPACE",begin);});
   }
   this.input.gamepad?.once("down",()=>this.scene.start("Training"));
 }
}
class Training extends Phaser.Scene{
 constructor(){super("Training");this.hero=null;}
 create(){
  this.coyote=0;this.buffer=0;this.wasJump=false;this.face=1;this.debugOn=false;
  this.lastSafe={x:START.x,y:START.y};
  this.cameras.main.setBackgroundColor("#eadfc8");
  this.physics.world.setBounds(0,0,WORLD.width,WORLD.height);
  this.drawBackground();
  var solids=this.physics.add.staticGroup();
  PLATFORMS.forEach((p,i)=>{
    var bottom=i<4;
    var rect=this.add.rectangle(p[0]+p[2]/2,p[1]+p[3]/2,p[2],p[3],bottom?0x435b4e:0x4f6a58);
    rect.setStrokeStyle(1,0x284236,.4);solids.add(rect);
    rect.body.updateFromGameObject();
    this.add.rectangle(p[0]+p[2]/2,p[1]+4,p[2],8,0x8ea86b).setDepth(4);
  });
  makeHero(this);
  window.AruandaCombat.makeCrawler(this);
  window.AruandaCombat.makeWisp(this);
  this.hero=this.physics.add.sprite(START.x,START.y,"hero").setDepth(15);
  this.hero.setCollideWorldBounds(true);
  var body=this.hero.body;
  body.setSize(32,62).setOffset(13,12);
  body.setGravityY(MOVE.gravity);
  body.setMaxVelocity(MOVE.speed,MOVE.maxFall);
  this.physics.add.collider(this.hero,solids);
  this.cameras.main.setBounds(0,0,WORLD.width,WORLD.height);
  this.cameras.main.startFollow(this.hero,false,.09,.1);
  this.cameras.main.setDeadzone(100,65);
  this.cameras.main.setFollowOffset(-40,10);
  this.cursors=this.input.keyboard?.createCursorKeys();
  this.keys=this.input.keyboard?.addKeys("A,D,W,S,J,R,F3,ESC");
  this.input.keyboard?.addCapture([32,37,38,39,40]);
  this.combat=new window.AruandaCombat.CombatSystem(this,solids);
  this.add.text(18,17,"O LIMIAR  /  TESTE AÉREO",{
   fontFamily:"Georgia,serif",fontSize:"17px",fontStyle:"bold",color:"#fff0d5",
   backgroundColor:"#263d32dd",padding:{x:12,y:8}
  }).setScrollFactor(0).setDepth(90);
  this.add.text(18,H-38,"A/D mover · Espaço pular · J atacar · no ar S/↓ + J: golpe baixo · R reiniciar · F3 debug",{
   fontFamily:"Arial,sans-serif",fontSize:"13px",color:"#fff1d7",
   backgroundColor:"#263d32dd",padding:{x:10,y:8}
  }).setScrollFactor(0).setDepth(90);
  this.debugText=this.add.text(W-18,17,"",{fontFamily:"monospace",fontSize:"12px",color:"#def3d9",backgroundColor:"#1b3429ee",padding:{x:10,y:9},lineSpacing:5})
    .setOrigin(1,0).setScrollFactor(0).setDepth(95).setVisible(false);
  label(this,2180,625,"FIM DA SALA  →",21,"#304b3e");
 }
 update(time,delta){
  if(!this.hero || !this.hero.active)return;
  var k=this.keys||{};
  if(k.R && Phaser.Input.Keyboard.JustDown(k.R)){this.scene.restart();return;}
  if(k.ESC && Phaser.Input.Keyboard.JustDown(k.ESC)){this.scene.start("Title");return;}
  if(k.F3 && Phaser.Input.Keyboard.JustDown(k.F3)){this.debugOn=!this.debugOn;this.debugText.setVisible(this.debugOn);}
  var left=!!(k.A?.isDown||this.cursors?.left.isDown);
  var right=!!(k.D?.isDown||this.cursors?.right.isDown);
  var axis=Number(right)-Number(left);
  var jump=!!(k.W?.isDown||this.cursors?.up.isDown||this.cursors?.space.isDown);
  var pad=this.input.gamepad?.gamepads.find(p=>p?.connected);
  if(pad){
    var stick=pad.axes?.[0]?.getValue()||0;
    var pa=Number(!!pad.buttons[15]?.pressed || stick>MOVE.deadzone)-Number(!!pad.buttons[14]?.pressed || stick< -MOVE.deadzone);
    if(pa)axis=pa;
    jump=jump||!!pad.buttons[0]?.pressed;
  }
  var pressed=jump&&!this.wasJump, released=!jump&&this.wasJump;this.wasJump=jump;
  var dt=Math.min(delta,50)/1000,body=this.hero.body;
  var grounded=body.blocked.down||body.touching.down;
  this.coyote=grounded?MOVE.coyote:Math.max(0,this.coyote-dt);
  this.buffer=pressed?MOVE.buffer:Math.max(0,this.buffer-dt);
  if(this.buffer>0&&this.coyote>0){body.setVelocityY(MOVE.jump);this.coyote=0;this.buffer=0;}
  if(released&&body.velocity.y<0)body.setVelocityY(body.velocity.y*MOVE.jumpCut);
  var target=axis*MOVE.speed;
  var accel=axis?(grounded?MOVE.groundAccel:MOVE.airAccel):(grounded?MOVE.groundDecel:MOVE.airDecel);
  if(!this.combat || this.time.now>=this.combat.knockbackUntil){body.setVelocityX(approach(body.velocity.x,target,accel*dt));}
  if(axis){this.face=axis;this.hero.setFlipX(axis<0);}
  if(grounded&&this.hero.y<WORLD.height-120)this.lastSafe={x:this.hero.x,y:this.hero.y};
  if(this.hero.y>WORLD.height-42){
    this.hero.setPosition(this.lastSafe.x,this.lastSafe.y-6);body.setVelocity(0,0);this.coyote=0;this.buffer=0;
  }
  var attackHeld=!!(k.J?.isDown||pad?.buttons?.[2]?.pressed);
  var downHeld=!!(k.S?.isDown||this.cursors?.down.isDown||pad?.buttons?.[13]?.pressed||
   (pad?.axes?.[1]?.getValue()||0)>.55);
  this.combat?.update(Math.min(delta,50),attackHeld,grounded,downHeld);
  if(this.debugOn)this.debugText.setText([
    "ARUANDA / SPRINT 03",
    "x: "+Math.round(this.hero.x)+"  y: "+Math.round(this.hero.y),
    "vx: "+Math.round(body.velocity.x)+"  vy: "+Math.round(body.velocity.y),
    "chão: "+(grounded?"SIM":"NÃO"),
    "coyote: "+this.coyote.toFixed(3),
    "buffer: "+this.buffer.toFixed(3),
    "gamepad: "+(pad?"CONECTADO":"não conectado"),
    ...(this.combat?.getDebugLines()||[])
  ]);
 }
 drawBackground(){
  var g=this.add.graphics().setDepth(-30);
  g.fillStyle(0xebe3cc);g.fillRect(0,0,WORLD.width,WORLD.height);
  g.fillStyle(0xfff4d6,.9);g.fillCircle(730,225,135);
  g.lineStyle(13,0xe3c893,.55);g.strokeCircle(730,225,155);
  [[160,295,245],[550,255,200],[990,315,275],[1380,265,280],[1770,325,250],[2190,270,290]]
    .forEach(function(p){
      g.fillStyle(0x869e8d,.28);g.fillEllipse(p[0],p[1]+33,p[2],75);
      g.fillStyle(0x678774,.28);g.fillRoundedRect(p[0]-p[2]/2,p[1],p[2],30,8);
      g.fillTriangle(p[0]-55,p[1]+25,p[0]+60,p[1]+25,p[0]+10,p[1]+115);
    });
  for(var x=0;x<WORLD.width;x+=390){
    g.fillStyle(0x688b77,.17);g.fillEllipse(x+120,660,570,180);
  }
  g.fillStyle(0x4b6755,.09);g.fillRect(0,735,WORLD.width,WORLD.height-735);
 }
}
new Phaser.Game({
 type:Phaser.AUTO,parent:"game-container",width:W,height:H,
 backgroundColor:"#eadfc8",render:{antialias:true,pixelArt:false},
 physics:{default:"arcade",arcade:{gravity:{x:0,y:0},debug:false}},
 input:{gamepad:true},
 scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
 scene:[Title,Training]
});
})();