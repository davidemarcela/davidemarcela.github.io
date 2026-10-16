# Cristais Sombrios

Jogo de cartas roguelike de terror, inspirado em **Inscryption** e com elementos de **Final Fantasy**.
É feito em HTML, CSS e JavaScript puro, sem dependências nem etapa de build.

> Você acorda numa cabana escura. Do outro lado da mesa, só dá para ver dois olhos brilhando.
> Para sair, você precisa purificar os quatro cristais apodrecidos. Se todas as suas velas se apagarem, você vira uma carta no baralho dele.

## Como jogar

- **Tabuleiro com 4 pistas.** Coloque suas criaturas na fileira de baixo. Ao **tocar o sino**, cada uma ataca a pista da frente.
- **Balança.** O dano que não é bloqueado pesa na balança. Em **+5** você vence; em **−5** uma vela se apaga e a batalha recomeça.
- **Fileira de cima:** mostra as cartas que o Guardião vai jogar no próximo turno.
- **Três custos:**
  - 🩸 **Sangue:** sacrifique criaturas que já estão na mesa.
  - 🦴 **Ossos:** você ganha um a cada criatura sua que morre.
  - **MP:** aumenta a cada turno (até 6) e enche de novo. Usado por magias e magos.
- **Comprar:** a cada turno, compre do seu baralho ou pegue uma **Alma Perdida** (0/1, ótima para sacrifícios).

### Elementos de Final Fantasy
- Classes: Cavaleiro Sombrio, Lanceiro (Salto), Paladino, Mago Negro, Mago Branco, Ladrão, Monge e Ninja.
- Magias com MP: Fogo, Gelo, Raio, Cura e Pena de Fênix.
- Invocações raras: Ifrit, Shiva, Odin (Corte Final) e Bahamut.
- Os **4 cristais** (Terra, Fogo, Água e Vento), cada um guardado por um demônio: Lich, Marilith, Kraken e Tiamat. Os chefes têm duas fases.

### Elementos de terror (Inscryption)
- Um narrador sinistro que fala com você durante a partida.
- Velas que funcionam como vidas.
- **Fogueira:** fortalece uma carta, mas, se você insistir, algo na escuridão pode devorá-la.
- **Altar:** sacrifique uma carta para transferir os sigilos dela para outra.
- **Mercador:** troque dentes por cartas.
- **Morte permanente com memória:** quando você perde, sua melhor carta vira um "retrato" seu, que pode aparecer contra você na próxima partida (fica salvo no `localStorage`).

### Sigilos
| Sigilo | Efeito |
| --- | --- |
| ⇡ Salto | Ataca a balança diretamente, ignorando a criatura à frente |
| ✶ Espinhos | Quem ataca esta carta sofre 1 de dano |
| ☠ Toque Mortal | Mata qualquer criatura que ferir |
| ♨ Fogo | Ao entrar, causa 2 de dano à criatura à frente |
| ✚ Cura | No início do turno, cura 1 dos aliados vizinhos |
| ♥ Sangue Digno | Vale 3 sacrifícios |
| ↺ Morto-Vivo | Na primeira vez que morre, volta |
| ⚔ Corte Final | Ao entrar, destrói a criatura à frente |
| ✧ Dreno | Ao causar dano, recupera 1 MP |
| ❄ Nevasca | Ao entrar, causa 1 de dano a todos os inimigos |

## Rodando localmente

O jogo usa módulos ES, então precisa ser servido por HTTP:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicando no GitHub Pages

Em **Settings → Pages**, escolha *Deploy from a branch*, branch `main`, pasta `/ (root)`.

## Estrutura

```
index.html       # telas: título, mapa, batalha, fim e janelas
css/style.css    # atmosfera (luz de vela, grão, tremor) e cartas
js/data.js       # cartas, sigilos, regiões/cristais e falas do Guardião
js/util.js       # criação e desenho de cartas, diálogo e sons (Web Audio)
js/batalha.js    # regras da batalha: pistas, sacrifícios, balança e IA
js/game.js       # mapa, eventos (fogueira, altar, mercador...), velas e fim
```

## Ideias para próximos passos

- Arte desenhada à mão no lugar dos emojis
- Mais sigilos e mais chefes com regras especiais
- Puzzles na cabana entre as batalhas (como os de Inscryption)
- Trilha sonora e efeitos de áudio gravados
- Salvar a partida no meio da run
