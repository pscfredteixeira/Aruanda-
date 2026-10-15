# Aruanda

Metroidvania 2D autoral inspirado nas cosmologias afro-brasileiras. O protagonista é um espírito perdido que explora um mundo de passagens interrompidas.

**Estado:** Sprints 00–01: fundação Web e prévia jogável de movimento. Ainda não é uma fase final.

**Jogar:** https://pscfredteixeira.github.io/Aruanda-/

## Publicação

A prévia atual usa Phaser 3.90.0, carregado por CDN, e arquivos estáticos \`index.html\` + \`game.js\`. Foi escolhida para funcionar com GitHub Pages configurado em **main / (root)**, sem build de servidor.

> O projeto principal continuará seguindo o planejamento Phaser + TypeScript + Vite. A migração do bootstrap estático para um build versionado será feita em sprint de infraestrutura, quando pudermos validar as dependências e o pipeline de deploy. O bootstrap atual não é a arquitetura final.

## Jogabilidade implementada

- Tela inicial e Test Room com plataformas e um percurso longo.
- Movimento com aceleração, frenagem e controle no ar.
- Pulo simples com altura variável, 120 ms de coyote time e 120 ms de jump buffer.
- Câmera seguindo o personagem, câmera com limites de mundo.
- Teclado (A/D, setas, W, Espaço), gamepad (D-pad, analógico e A/Cross).
- Reiniciar com R, debug F3, voltar ao menu com Esc.

## Escopo ainda não implementado

Combate, inimigos, coleta, checkpoints, salvamento, sprites finais e fase completa.

## Observações

- Necessária conexão com a internet para carregar Phaser via CDN. Há um segundo CDN de contingência.
- Os desenhos atuais são geométricos/vetoriais provisórios.
- Suporte a gamepad depende do navegador e ainda requer teste físico.
- Os parâmetros estão em \`game.js\`, bloco \`MOVE\`.

### Design aprovado

- Protagonista negro estilizado com vara quebrada.
- 5 pontos de vida no futuro; três tipos de inimigos; Ecos, Fragmentos de Memória e Essência Vital.
- Fase 1 extensa, com exploração superior e inferior, acessível com pulo simples.
- Exu como guia, orixás concedendo poderes nas fases seguintes.

O arquivo \`docs/SPRINT_STATUS.md\` acompanha o andamento.