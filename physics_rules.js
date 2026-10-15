/* Aruanda - regras para atravessar plataformas suspensas */
(function(root){
"use strict";
const EPSILON=8;
function canCollidePlayerWithPlatform(player,platform){
  if(!platform || typeof platform.getData!=="function" || !platform.getData("oneWay"))return true;
  const hero=player&&player.body,ledge=platform.body;
  if(!hero||!ledge||!hero.prev)return false;
  const previousBottom=hero.prev.y+hero.height;
  return hero.velocity.y>=0 && previousBottom<=ledge.top+EPSILON;
}
function maxJumpRise(velocity,gravity){
  if(!Number.isFinite(velocity)||!Number.isFinite(gravity)||gravity<=0)return 0;
  return velocity*velocity/(2*gravity);
}
const api={canCollidePlayerWithPlatform,maxJumpRise};
root.AruandaPhysics=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
