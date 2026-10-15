# Sprint 02 — Roteiro de validação manual

Abra https://pscfredteixeira.github.io/Aruanda-/ e inicie a sala.

1. A/D, setas, Espaço e W continuam respondendo igual à versão anterior.
2. J: um golpe curto para frente, com efeito dourado visível.
3. J, soltar, J enquanto o primeiro golpe está em curso: segundo golpe mais amplo.
4. Ao virar à esquerda, o ataque deve acertar apenas no lado esquerdo.
5. O Espírito Rastejante próximo ao início patrulha e aproxima-se quando você chega perto.
6. Dois acertos separados matam o inimigo. O contador de eliminações aumenta.
7. O inimigo reaparece após alguns segundos para novo teste.
8. Encostar no inimigo reduz um dos 5 indicadores de vida.
9. Durante ~0,8s após sofrer dano, o jogador pisca e não perde HP repetidamente.
10. Perder os 5 HP reinicia a sala de teste.
11. F3 mostra HP, ataque, fila do combo, invulnerabilidade e IA do inimigo.
12. No controle físico, analógico e D-pad movem, A/Cross pula, X/Square ataca.
13. R reinicia, Esc retorna ao menu.
14. Testar em Firefox/Chrome/Edge e conferir mensagens de erro no console.

**Não aprovado automaticamente:** a resposta tátil e visual, posicionamento de colisões e suporte físico a controle dependem de teste real.

Parâmetros de ajuste: \`combat.js\` bloco \`COMBAT\`; movimento: \`game.js\` bloco \`MOVE\`.
