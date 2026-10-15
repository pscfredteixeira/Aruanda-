/* ARUANDA — Sprint 02 / combate modular, Phaser 3.90.0 */
(function(){
"use strict";
var Phaser=window.Phaser;
var COMBAT={
 maxHP:5,invulnerability:800,playerKnockbackX:170,playerKnockbackY:-230,
 attack1:{duration:260,activeFrom:65,activeUntil:175},
 attack2:{duration:325,activeFrom:75,activeUntil:220},
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
class CombatSystem{
 constructor(scene,solids){
  this.scene=scene;this.solids=solids;this.hero=scene.hero;
  this.hp=COMBAT.maxHP;this.dead=false;this.invulUntil=0;this.knockbackUntil=0;
  this.attack=0;this.attackElapsed=0;this.queued=false;this.held=false;
  this.hitThisSwing=new Set();this.debug=false;this.enemy=null;this.enemyState="patrulha";this.killCount=0;
  this.fx=scene.add.graphics().setDepth(40);
  this.hud=scene.add.text(18,62,"",{fontFamily:"Arial,sans-serif",fontSize:"17px",fontStyle:"bold",color:"#fff2d5",backgroundColor:"#263d32dd",padding:{x:11,y:7}}).setDepth(90).setScrollFactor(0);
  this.message=scene.add.text(18,102,"",{fontFamily:"Arial,sans-serif",fontSize:"13px",color:"#e9e4ca",backgroundColor:"#263d32aa",padding:{x:9,y:6}}).setDepth(90).setScrollFactor(0);
  this.updateHud();
  this.spawnEnemy();
  this.onShutdown=()=>this.cleanup();
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN,this.onShutdown);
 }
 updateHud(){
  var full="◆ ".repeat(this.hp),empty="◇ ".repeat(Math.max(0,COMBAT.maxHP-this.hp));
  this.hud.setText("VIDA  "+full+empty);
  this.message.setText("J / X-□  atacar   ·   R  reiniciar   ·   eliminações: "+this.killCount);
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
 startAttack(number){
  if(this.dead)return;
  this.attack=number;this.attackElapsed=0;this.queued=false;this.hitThisSwing.clear();
  this.scene.hero.setTint(0xf9e6aa);
 }
 update(dt,attackHeld){
  var s=this.scene,now=s.time.now;
  if(!this.hero?.active)return;
  var press=attackHeld&&!this.held;this.held=!!attackHeld;
  if(press && !this.dead){
   if(!this.attack)this.startAttack(1);
   else if(this.attack===1)this.queued=true;
  }
  this.fx.clear();
  if(this.attack){
   this.attackElapsed+=dt;
   var spec=this.attack===1?COMBAT.attack1:COMBAT.attack2;
   if(this.attackElapsed>=spec.activeFrom&&this.attackElapsed<=spec.activeUntil){
    var direction=s.face||1;
    // Rect in world coordinates; the physical staff's attack area faces the player direction.
    var x=this.hero.x+(direction>0?15:-77);
    var y=this.hero.y+4;
    var reach=this.attack===1?62:76;
    if(direction<0)x=this.hero.x-reach-14;
    var rect=new Phaser.Geom.Rectangle(x,y,reach,47);
    this.fx.fillStyle(this.attack===1?0xe9cd89:0xf0e5b7,.32);this.fx.fillRoundedRect(rect.x,rect.y,rect.width,rect.height,14);
    this.fx.lineStyle(3,0xf6ead2,.82);this.fx.strokeRoundedRect(rect.x,rect.y,rect.width,rect.height,14);
    if(this.debug){this.fx.lineStyle(1,0xff7659,1);this.fx.strokeRectShape(rect);}
    var e=this.enemy;
    if(e && e.active && !e.dead && !this.hitThisSwing.has(e)){
     var b=e.body;
     var hurtbox=new Phaser.Geom.Rectangle(b.x,b.y,b.width,b.height);
     if(Phaser.Geom.Intersects.RectangleToRectangle(rect,hurtbox)){
      this.hitThisSwing.add(e);this.hitEnemy(e,direction);
     }
    }
   }
   if(this.attackElapsed>=spec.duration){
    if(this.attack===1&&this.queued)this.startAttack(2);
    else{this.attack=0;this.attackElapsed=0;this.queued=false;this.hero.clearTint();}
   }
  }
  this.updateEnemy(now);
  if(!this.dead && now<this.invulUntil){
   this.hero.setAlpha(Math.floor(now/85)%2===0?.42:1);
  }else this.hero.setAlpha(1);
  if(this.enemyBar && this.enemy?.active){
   var e=this.enemy;
   this.enemyBar.clear();this.enemyBar.fillStyle(0x20392d,.9);this.enemyBar.fillRoundedRect(e.x-19,e.y-34,38,6,3);
   this.enemyBar.fillStyle(0xd9c184,1);this.enemyBar.fillRoundedRect(e.x-17,e.y-32,Math.max(0,34*e.hp/COMBAT.enemyHP),2,1);
  }
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
 hitEnemy(enemy,face){
  var s=this.scene;
  enemy.hp=Math.max(0,enemy.hp-1);
  enemy.setTintFill(0xfff4dc);
  enemy.stunnedUntil=s.time.now+COMBAT.enemyStun;
  enemy.body.setVelocity(face*COMBAT.enemyKnockbackX,COMBAT.enemyKnockbackY);
  s.time.delayedCall(125,()=>{if(enemy.active&&!enemy.dead)enemy.clearTint();});
  if(!s.physics.world.isPaused){
   s.physics.world.pause();
   s.time.delayedCall(COMBAT.hitstop,()=>{if(s.sys.isActive())s.physics.world.resume();});
  }
  if(enemy.hp===0){
   enemy.dead=true;this.enemyState="derrotado";
   this.killCount++;this.updateHud();
   enemy.disableBody(true,true);
   this.enemyBar?.clear();
   // Test room: an enemy reappears so the combat loop can be tested without restarting.
   s.time.delayedCall(COMBAT.enemyRespawn,()=>{
    if(!s.sys.isActive())return;
    this.destroyEnemy();
    this.spawnEnemy();
   });
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
  this.fx?.destroy();this.hud?.destroy();this.message?.destroy();this.destroyEnemy();
 }
 getDebugLines(){
  return ["HP: "+this.hp+"/"+COMBAT.maxHP,"ataque: "+(this.attack||"nenhum"),"combo fila: "+(this.queued?"SIM":"NÃO"),
   "invulnerável: "+(this.scene.time.now<this.invulUntil?"SIM":"NÃO"),
   "inimigo HP: "+(this.enemy?.hp??"-"),"IA: "+this.enemyState,"eliminações: "+this.killCount];
 }
}
window.AruandaCombat={CombatSystem:CombatSystem,SETTINGS:COMBAT,makeCrawler:makeCrawler};
})();