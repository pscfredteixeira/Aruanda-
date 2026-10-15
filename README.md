# Aruanda

Metroidvania 2D autoral inspirado nas cosmologias afro-brasileiras.

**Estado:** Sprint 02 — prévia jogável de movimento e combate.

**Jogar:** https://pscfredteixeira.github.io/Aruanda-/

## Jogabilidade atual
- Sala de teste com plataformas, saltos e câmera seguindo o protagonista.
- Corrida, pulo curto e longo, coyote time e jump buffer.
- Combate com a vara quebrada: golpe inicial e segundo golpe encadeado com novo pressionamento.
- Alcance de ataque com hitbox temporária, orientação esquerda/direita, acerto único por golpe, feedback visual, hit-stop e knockback.
- Espírito Rastejante com 2 HP, patrulha, perseguição curta, atordoamento e reaparecimento para testes.
- Jogador com 5 HP, dano por contato, invulnerabilidade temporária e reinício após perder toda a vida.
- HUD básico de vida, eliminações e debug (F3).
- Teclado: A/D ou setas para andar; Espaço/W/↑ para pular; J para atacar; R reiniciar; Esc menu.
- Gamepad: analógico/D-pad para andar; A/Cross pular; X/Square atacar.

## Publicação
A versão desta entrega é HTML + JavaScript com Phaser 3.90.0 carregado por CDN, compatível com GitHub Pages configurado para **main/(root)**. Os scripts executam em ordem: Phaser, combat.js, game.js.

A arquitetura Phaser + TypeScript + Vite permanece como direção para uma migração posterior; o protótipo estático foi escolhido para publicação direta sem build.

## Fora do escopo atual
Ataque aéreo e para baixo, inimigo flutuante, chefe opcional, coleta de recursos, checkpoints, saves e mapa definitivo.

## Testes
Revisar manualmente no navegador: movimento, combo em J, direção dos golpes, dano, HUD, contato inimigo-jogador, hit-stop, respawn e controle real. Referência: \`docs/SPRINT_02_TESTES.md\`.

Os visuais atuais são placeholders vetoriais, não a arte definitiva.
