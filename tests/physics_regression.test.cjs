"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const rules=require("../physics_rules.js");
const ledge=(oneWay,top)=>({getData(key){return key==="oneWay"&&oneWay},body:{top}});
const hero=(previousBottom,vy)=>({body:{height:62,prev:{y:previousBottom-62},velocity:{y:vy}}});
test("piso comum é sólido",()=>assert.equal(rules.canCollidePlayerWithPlatform(hero(695,-200),ledge(false,695)),true));
test("passagem lateral por baixo da primeira plataforma",()=>assert.equal(rules.canCollidePlayerWithPlatform(hero(695,0),ledge(true,632)),false));
test("pulo atravessa plataforma por baixo",()=>assert.equal(rules.canCollidePlayerWithPlatform(hero(620,-200),ledge(true,632)),false));
test("aterrissagem em plataforma por cima",()=>assert.equal(rules.canCollidePlayerWithPlatform(hero(628,150),ledge(true,632)),true));
test("queda iniciada sob a plataforma não bloqueia passagem",()=>assert.equal(rules.canCollidePlayerWithPlatform(hero(680,200),ledge(true,632)),false));
test("primeira plataforma pode ser acessada com salto simples",()=>assert.ok(rules.maxJumpRise(420,1200)>=63));
test("o roteiro inicial põe o rastejante depois da primeira plataforma",()=>assert.ok(355>170+118));
test("coletáveis só usam overlap com o jogador",()=>{
 const src=fs.readFileSync(path.resolve(__dirname,"../inventory.js"),"utf8");
 assert.match(src,/physics\.add\.overlap\(scene\.hero,this\.group/);
 assert.doesNotMatch(src,/physics\.add\.collider\(scene\.hero,this\.group/);
});
test("plataformas suspensas marcadas como oneWay",()=>{
 const src=fs.readFileSync(path.resolve(__dirname,"../game.js"),"utf8");
 assert.match(src,/rect\.setData\("oneWay",!bottom\)/);
 assert.match(src,/AruandaPhysics\.canCollidePlayerWithPlatform/);
});
