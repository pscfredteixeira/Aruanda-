/* ARUANDA — Sprint 03 / combate no chão e no ar, inimigo flutuante, Phaser 3.90.0 */
(function(){
"use strict";
var Phaser=window.Phaser;
var COMBAT={
 maxHP:5,invulnerability:800,playerKnockbackX:170,playerKnockbackY:-230,
 attack1:{duration:260,activeFrom:65,activeUntil:175},
 attack2:{duration:325,activeFrom:75,activeUntil:220},
 airAttack:{duration:280,activeFrom:42,activeUntil:195},
 downAttack:{duration:320,activeFrom:52,activeUntil:230},
 downBounce:-350,
 wispHP:2,wispRespawn:3400,wispChaseRange:220,wispSpeed:72,
 hitstop:52,enemyHP:2,enemyPatrolSpeed:44,enemyChaseSpeed:78,
 enemyKnockbackX:155,enemyKnockbackY:-125,enemyStun:310,
 enemyRespawn:3500, enemyLeft:280,enemyRight:418,aggroRange:185
};
function makeCrawler(scene){
 if(scene.textures.exists("crawler"))return;
 var g=scene.make.graphics({x:0,y:0},false);
 g.fillStyle(0x33342e);g.fillEllipse(21,26,34,22);
 g.fillStyle(0x393e32);g.fillCircle(27,22,13);
 g.fillStyle(0x393e32);g.fillTriangle(4,21,2,13,15,17);
 g.fillStyle(0x526447);g.fillEllipse(19,9,11,5);
 g.fillStyle(0xe9e1c8);g.fillEllipse(29,22,21,20);
 g.fillStyle(0x292c25);g.fillEllipse(26,22,3.5,5);g.fillEllipse(34,22,3.5,5);
 g.fillStyle(0x33342e);g.fillRoundedRect(7,32,7,6,2);g.fillRoundedRect(26,32,7,6,2);
 g.generateTexture("crawler",44,44);g.destroy();
}
function makeWisp(scene){
 if(scene.textures.exists("wisp"))return;
 var g=scene.make.graphics({x:0,y:0},false);
 // Friendly-looking ghostly silhouette, but recognisably hostile in-game.
 g.fillStyle(0x313830);g.fillEllipse(23,25,30,33);
 g.fillTriangle(12,30,9,47,25,40);
 g.fillTriangle(24,31,30,53,37,30);
 g.fillStyle(0x435248);g.fillCircle(14,15,11);g.fillEllipse(36,20,15,22);
 g.fillStyle(0xf2edd6);g.fillEllipse(24,22,25,24);
 g.fillStyle(0x29312b);g.fillEllipse(18,22,4,7);g.fillEllipse(29,22,4,7);
 g.fillStyle(0xaebc9c);g.fillEllipse(37,10,9,4);
 g.generateTexture("wisp",48,58);g.destroy();
}
class CombatSystem{
 constructor(scene,solids){
  this.scene=scene;this.solids=solids;this.hero=scene.hero;
  this.hp=COMBAT.maxHP;this.dead=false;this.invulUntil=0;this.knockbackUntil=0;
  this.attack=0;this.attackElapsed=0;this.queued=false;this.held=false;this.airUsed=false;
  this.hitThisSwing=new Set();this.debug=false;this.enemy=null;this.enemyState="patrulha";this.flier=null;this.flierState="aguardando";this.killCount=0;
  this.fx=scene.add.graphics().setDepth(40);
  this.hud=scene.add.text(18,62,"",{fontFamily:"Arial,sans-serif",fontSize:"17px",fontStyle:"bold",color:"#fff2d5",backgroundColor:"#263d32dd",padding:{x:11,y:7}}).setDepth(90).setScrollFactor(0);
  this.message=scene.add.text(18,102,"",{fontFamily:"Arial,sans-serif",fontSize:"13px",color:"#e9e4ca",backgroundColor:"#263d32aa",padding:{x:9,y:6}}).setDepth(90).setScrollFactor(0);
  this.updateHud();
  this.spawnEnemy();
  this.spawnFlier();
  this.onShutdown=()=>this.cleanup();
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN,this.onShutdown);
 }
 updateHud(){
  var full="◆ ".repeat(this.hp),empty="◇ ".repeat(Math.max(0,COMBAT.maxHP-this.hp));
  this.hud.setText("VIDA  "+full+empty);
  this.message.setText("J atacar  ·  no ar: J  ·  para baixo: S/↓ + J  ·  eliminações: "+this.killCount);
 }
 spawnEnemy(){
  if(this.enemy)return;
  var s=this.scene;
  var e=s.physics.add.sprite(355,650,"crawler").setDepth(14);
  e.setCollideWorldBounds(true);
  e.body.setSize(32,25).setOffset(6,13);
  e.body.setGravityY(1200);e.body.setMaxVelocity(110,900);
  e.hp=COMBAT.enemyHP;e.direction=-1;e.stunnedUntil=0;e.dead=false;
  this.enemy=e;this.enemyState="patrulha";
  this.enemyFloorCollider=s.physics.add.collider(e,this.solids);
  this.enemyPlayerOverlap=s.physics.add.overlap(s.hero,e,()=>this.hurtPlayer(e),null,s);
  this.enemyBar=s.add.graphics().setDepth(50);
 }
 destroyEnemy(){
  this.enemyFloorCollider?.destroy();this.enemyPlayerOverlap?.destroy();
  this.enemyBar?.destroy();
  if(this.enemy)this.enemy.destroy();
  this.enemy=null;this.enemyBar=null;this.enemyFloorCollider=null;this.enemyPlayerOverlap=null;
 }
 spawnFlier(){
  if(this.flier)return;
  var s=this.scene;
  var e=s.physics.add.sprite(444,497,"wisp").setDepth(15);
  e.setCollideWorldBounds(true);e.body.setAllowGravity(false);
  e.body.setSize(29,35).setOffset(9,12);
  e.hp=COMBAT.wispHP;e.dead=false;e.stunnedUntil=0;
  e.homeX=444;e.homeY=497;
  this.flier=e;this.flierState="flutuando";
  this.flierOverlap=s.physics.add.overlap(s.hero,e,()=>this.hurtPlayer(e),null,s);
  this.flierBar=s.add.graphics().setDepth(50);
 }
 destroyFlier(){
  this.flierOverlap?.destroy();this.flierBar?.destroy();
  if(this.flier)this.flier.destroy();
  this.flier=null;this.flierBar=null;this.flierOverlap=null;
 }
 updateFlier(now){
  var e=this.flier;
  if(!e||!e.active||e.dead)return;
  if(now<e.stunnedUntil){this.flierState="atordoado";return;}
  var dx=this.hero.x-e.x,dy=this.hero.y-e.y;
  var aggro=!this.dead&&Math.abs(dx)<COMBAT.wispChaseRange&&Math.abs(dy)<145;
  var targetX=aggro?this.hero.x:e.homeX+42*Math.sin(now/1500);
  var targetY=aggro?this.hero.y-9:e.homeY+22*Math.sin(now/540);
  var vx=Phaser.Math.Clamp((targetX-e.x)*1.8,-COMBAT.wispSpeed,COMBAT.wispSpeed);
  var vy=Phaser.Math.Clamp((targetY-e.y)*1.7,-COMBAT.wispSpeed,COMBAT.wispSpeed);
  e.body.setVelocity(vx,vy);
  e.setFlipX(vx<0);
  this.flierState=aggro?"aproximando":"flutuando";
 }
 drawEnemyBar(enemy,graphics,maxHP){
  if(!enemy?.active||!graphics)return;
  graphics.clear();
  graphics.fillStyle(0x20392d,.92);
  graphics.fillRoundedRect(enemy.x-20,enemy.y-38,40,7,3);
  graphics.fillStyle(0xe2c58c);
  graphics.fillRoundedRect(enemy.x-18,enemy.y-36,36*enemy.hp/maxHP,3,1);
 }
 startAttack(number){
  if(this.dead)return;
  this.attack=number;this.attackElapsed=0;this.queued=false;this.hitThisSwing.clear();
  if(number>=3)this.airUsed=true;
  this.scene.hero.setTint(0xf9e6aa);
 }
 update(dt,attackHeld,grounded,downHeld){
  var s=this.scene,now=s.time.now;
  if(!this.hero?.active)return;
  if(grounded)this.airUsed=false;
  this.debug=!!s.debugOn;
  var press=attackHeld&&!this.held;
  this.held=!!attackHeld;
  if(press&&!this.dead){
    if(!this.attack){
      if(grounded)this.startAttack(1);
      else if(!this.airUsed)this.startAttack(downHeld?4:3);
    }else if(this.attack===1&&grounded){
      this.queued=true;
    }
  }
  this.fx.clear();
  if(this.attack){
    this.attackElapsed+=dt;
    var spec=this.attack===1?COMBAT.attack1:
      this.attack===2?COMBAT.attack2:
      this.attack===3?COMBAT.airAttack:COMBAT.downAttack;
    if(this.attackElapsed>=spec.activeFrom&&this.attackElapsed<=spec.activeUntil){
      var direction=s.face||1;
      var rect,reach;
      if(this.attack===4){
        // Staff thrust below the feet. Bounce only after a successful hit.
        rect=new Phaser.Geom.Rectangle(this.hero.x-23,this.hero.y+18,46,65);
      }else{
        reach=this.attack===2?76:this.attack===3?70:62;
        rect=new Phaser.Geom.Rectangle(
          this.hero.x+(direction>0?15:-reach-14),
          this.hero.y+(this.attack===3?-33:4),
          reach,this.attack===3?61:47
        );
      }
      this.fx.fillStyle(this.attack===4?0x8ed0c0:0xe9cd89,.30);
      this.fx.fillRoundedRect(rect.x,rect.y,rect.width,rect.height,12);
      this.fx.lineStyle(3,this.attack===4?0xb0ecdf:0xf6ead2,.89);
      this.fx.strokeRoundedRect(rect.x,rect.y,rect.width,rect.height,12);
      if(this.debug){this.fx.lineStyle(2,0xff795d,1);this.fx.strokeRectShape(rect);}
      for(var enemy of [this.enemy,this.flier]){
        if(!enemy||!enemy.active||enemy.dead||this.hitThisSwing.has(enemy))continue;
        var body=enemy.body;
        var hurtbox=new Phaser.Geom.Rectangle(body.x,body.y,body.width,body.height);
        if(Phaser.Geom.Intersects.RectangleToRectangle(rect,hurtbox)){
          this.hitThisSwing.add(enemy);
          this.hitEnemy(enemy,direction,this.attack);
        }
      }
    }
    if(this.attackElapsed>=spec.duration){
      if(this.attack===1&&this.queued&&grounded)this.startAttack(2);
      else {this.attack=0;this.attackElapsed=0;this.queued=false;this.hero.clearTint();}
    }
  }
  this.updateEnemy(now);
  this.updateFlier(now);
  if(!this.dead&&now<this.invulUntil)this.hero.setAlpha(Math.floor(now/85)%2===0?.42:1);
  else this.hero.setAlpha(1);
  if(this.enemyBar&&this.enemy?.active)this.drawEnemyBar(this.enemy,this.enemyBar,COMBAT.enemyHP);
  if(this.flierBar&&this.flier?.active)this.drawEnemyBar(this.flier,this.flierBar,COMBAT.wispHP);
 }
 updateEnemy(now){
  var e=this.enemy;
  if(!e||!e.active||e.dead)return;
  if(now<e.stunnedUntil){this.enemyState="atordoado";return;}
  var dx=this.hero.x-e.x,dy=this.hero.y-e.y;
  var chase=!this.dead&&Math.abs(dx)<COMBAT.aggroRange&&Math.abs(dy)<95&&this.hero.x>=COMBAT.enemyLeft&&this.hero.x<=COMBAT.enemyRight;
  if(chase){e.direction=dx>=0?1:-1;this.enemyState="perseguindo";}
  else {
   this.enemyState="patrulha";
   if(e.x<COMBAT.enemyLeft)e.direction=1;
   if(e.x>COMBAT.enemyRight)e.direction=-1;
  }
  e.body.setVelocityX(e.direction*(chase?COMBAT.enemyChaseSpeed:COMBAT.enemyPatrolSpeed));
  e.setFlipX(e.direction<0);
 }
 hitEnemy(enemy,face,attackType){
  var s=this.scene;
  enemy.hp=Math.max(0,enemy.hp-1);
  enemy.setTintFill(0xfff4dc);
  enemy.stunnedUntil=s.time.now+COMBAT.enemyStun;
  enemy.body.setVelocity(face*COMBAT.enemyKnockbackX,COMBAT.enemyKnockbackY);
  if(attackType===4 && !this.dead){
    // Downward staff hit propels the spirit up, but never grants a free double jump.
    this.hero.body.setVelocityY(COMBAT.downBounce);
    s.coyote=0;s.buffer=0;
    this.attack=0;this.attackElapsed=0;this.queued=false;
    this.hero.clearTint();
  }
  s.time.delayedCall(125,()=>{if(enemy.active&&!enemy.dead)enemy.clearTint();});
  if(!s.physics.world.isPaused){
   s.physics.world.pause();
   s.time.delayedCall(COMBAT.hitstop,()=>{if(s.sys.isActive())s.physics.world.resume();});
  }
  if(enemy.hp===0){
    enemy.dead=true;
    this.killCount++;this.updateHud();
    enemy.disableBody(true,true);
    if(enemy===this.enemy){
      this.enemyState="derrotado";
      this.enemyBar?.clear();
      s.time.delayedCall(COMBAT.enemyRespawn,()=>{
        if(!s.sys.isActive())return;
        this.destroyEnemy();this.spawnEnemy();
      });
    }else if(enemy===this.flier){
      this.flierState="derrotado";
      this.flierBar?.clear();
      s.time.delayedCall(COMBAT.wispRespawn,()=>{
        if(!s.sys.isActive())return;
        this.destroyFlier();this.spawnFlier();
      });
    }
  }
 }
 hurtPlayer(enemy){
  var s=this.scene,now=s.time.now;
  if(this.dead||!enemy?.active||enemy.dead||now<this.invulUntil)return;
  this.hp=Math.max(0,this.hp-1);
  this.invulUntil=now+COMBAT.invulnerability;
  this.knockbackUntil=now+220;
  this.hero.body.setVelocity(this.hero.x<enemy.x?-COMBAT.playerKnockbackX:COMBAT.playerKnockbackX,COMBAT.playerKnockbackY);
  this.hero.setTintFill(0xc98065);
  s.time.delayedCall(120,()=>{if(s.sys.isActive()&&this.hero.active&& !this.attack)this.hero.clearTint();});
  this.updateHud();
  if(this.hp===0){
   this.dead=true;this.attack=0;this.hero.setAlpha(.45);
   s.time.delayedCall(700,()=>{if(s.sys.isActive())s.scene.restart();});
  }
 }
 cleanup(){
  this.fx?.destroy();this.hud?.destroy();this.message?.destroy();this.destroyEnemy();this.destroyFlier();
 }
 getDebugLines(){
  return ["HP: "+this.hp+"/"+COMBAT.maxHP,"ataque: "+(this.attack||"nenhum"),"combo fila: "+(this.queued?"SIM":"NÃO"),
   "invulnerável: "+(this.scene.time.now<this.invulUntil?"SIM":"NÃO"),
   "rastejante HP: "+(this.enemy?.hp??"-"),"IA: "+this.enemyState,
   "flutuante HP: "+(this.flier?.hp??"-"),"IA aérea: "+this.flierState,
   "ataque aéreo usado: "+(this.airUsed?"SIM":"NÃO"),"eliminações: "+this.killCount];
 }
}
window.AruandaCombat={CombatSystem:CombatSystem,SETTINGS:COMBAT,makeCrawler:makeCrawler,makeWisp:makeWisp};
})();