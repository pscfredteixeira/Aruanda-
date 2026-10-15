# Aruanda

Metroidvania 2D autoral inspirado nas cosmologias afro-brasileiras.

**Sprint atual:** 03 — Combate aéreo e Espírito Flutuante.

**Jogar:** https://pscfredteixeira.github.io/Aruanda-/

## Funcionalidades

- Movimento, câmera, pulo com altura variável, coyote time e jump buffer dos sprints anteriores.
- Vara quebrada: dois golpes terrestres, ataque horizontal no ar e ataque para baixo.
- Golpe para baixo: impulsiona para cima quando atinge um inimigo (pogo); não é pulo duplo.
- Espírito Rastejante (2 HP): patrulha e persegue o jogador.
- Espírito Flutuante (2 HP): flutua e persegue o personagem quando próximo.
- Hitbox ativa por janela de ataque, acerto único por inimigo e golpe, hit-stop, knockback e feedback visual.
- Vida (5 HP), invulnerabilidade temporária, contador de eliminações e reinício após morte.
- Ambos os inimigos reaparecem na sala de teste.
- HUD inicial e painel de diagnóstico F3.

## Controles

| Ação | Teclado | Controle |
| --- | --- | --- |
| Mover | A/D ou setas | Analógico esquerdo ou D-pad |
| Pular | Espaço, W, ↑ | A / Cross |
| Atacar no chão | J | X / Square |
| Atacar no ar | J durante o salto | X / Square durante o salto |
| Golpe para baixo | S/↓ + J no ar | D-pad para baixo + X / Square no ar |
| Reiniciar teste | R | — |
| Debug | F3 | — |
| Menu | Esc | — |

O ataque aéreo pode ser utilizado uma vez por salto até tocar o chão. O impulso de pogo depende de acertar um inimigo com o golpe para baixo.

## Publicação

O protótipo utiliza Phaser 3.90.0 por CDN e JavaScript estático na raiz, compatível com GitHub Pages branch main / (root). Migração para TypeScript + Vite permanece planejada.

## Estado dos testes

A sintaxe do JavaScript pode ser verificada automaticamente, mas a execução real, colisão, controle e game feel precisam ser avaliados jogando no navegador. Veja `docs/SPRINT_03_TESTES.md`.

Ainda não foram implementados: coletáveis, cura, checkpoints persistentes, o mapa completo e a arte final.
