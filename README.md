# Aruanda

Metroidvania 2D autoral inspirado nas cosmologias afro-brasileiras.

**Sprint atual:** 04 — Ecos, Fragmentos de Memória e Essência Vital.

**Jogar:** https://pscfredteixeira.github.io/Aruanda-/

## Jogabilidade disponível
- Movimento, câmera, pulo simples/variável, coyote time, jump buffer.
- Combate com a vara quebrada: 2 golpes, ataque no ar e ataque descendente (pogo).
- Espírito Rastejante + Espírito Flutuante, knockback, hit-stop, vida e dano.
- Ecos: itens fixos no cenário e drops ao derrotar inimigos, de valor variável.
- Fragmentos de Memória: 6 ao longo da sala, únicos e salvos depois da coleta.
- Essência Vital: até 3 unidades armazenadas; cura 1 HP após 0,56 segundos.
- Contadores no HUD, mensagens de coleta e feedback de cura.
- Persistência inicial em localStorage: Ecos, memórias e pickups fixos adquiridos. Não é o sistema de save completo.

## Controles
| Ação | Teclado | Controle |
| --- | --- | --- |
| Mover | A/D ou setas | D-pad/analógico |
| Pular | Espaço, W, seta para cima | A / Cross |
| Atacar | J | X / Square |
| Ataque descendente | S ou seta para baixo + J no ar | Baixo + X/Square no ar |
| Curar | K | B / Circle |
| Reiniciar a sala | R | — |
| Debug | F3 | — |
| Voltar ao menu | Esc | — |

**Teste de cura:** colete uma Essência, receba 1 ponto de dano tocando num inimigo, depois pressione K.

## Publicação
Projeto Web estático, sem build: HTML + JS, Phaser 3.90.0 via CDN, GitHub Pages main / root. Arquivos carregados em ordem: `combat.js`, `inventory.js`, `game.js`. Migração futura para TypeScript + Vite continua prevista.

## Escopo futuro
Checkpoints, save completo, Fase 1 com 15 salas, cenários e sprites definitivos, Exu e regiões dos orixás.

Consultar `docs/SPRINT_04_TESTES.md` para validar o sprint.


## Hotfix de colisões após Sprint 04

As plataformas suspensas agora são atravessáveis de baixo e lateralmente; pousar de cima continua possível. O chão permanece sólido. O primeiro inimigo pode ser alcançado caminhando para a direita. Os itens não colidem solidamente com o herói: apenas overlap. Regras isoladas em physics_rules.js, com testes em tests/physics_regression.test.cjs.
