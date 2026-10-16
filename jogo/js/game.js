import { CARTAS, DECK_INICIAL, RECOMPENSAS, REGIOES, FALAS, LEIS, SIGILOS, LIMITE } from './data.js';
import {
  $, esperar, sortear, embaralhar, instanciar, clonar, elementoCarta, falar, falarVarias, tremer, som,
  abrirModal, fecharModal, botao, escolherOpcao,
} from './util.js';
import { Batalha } from './batalha.js';

const CHAVE_ALMA = 'cristais-sombrios:alma';
const TITULO = 'Cristais Sombrios';
const MAX_VELAS = 2;
const MAX_SIGILOS = 3;
const PASSOS_POR_REGIAO = 3;

let jogo = null;

// ---------- Telas ----------

function mostrarTela(nome) {
  for (const tela of document.querySelectorAll('.tela')) tela.classList.add('oculto');
  $(`tela-${nome}`).classList.remove('oculto');
  $('hud').classList.toggle('oculto', nome === 'titulo' || nome === 'fim');
  atualizarHud();
}

function atualizarHud() {
  if (!jogo) return;
  $('hud-velas').textContent = '🕯️'.repeat(jogo.velas) || '—';
  $('hud-dentes').textContent = jogo.dentes;
  $('hud-baralho').textContent = jogo.deck.length;
}

function nomesDeSigilos(carta) {
  return carta.sigilos.map(s => `${SIGILOS[s].icone} ${SIGILOS[s].nome}`).join(' · ');
}

function linhaDeCartas(cartas, aoClicar, extra = nomesDeSigilos) {
  const linha = document.createElement('div');
  linha.className = 'linha-cartas';
  for (const carta of cartas) {
    const caixa = document.createElement('div');
    caixa.className = 'opcao-carta';
    caixa.appendChild(elementoCarta(carta));
    const rotulo = extra(carta);
    if (rotulo) caixa.insertAdjacentHTML('beforeend', `<div class="rotulo">${rotulo}</div>`);
    if (aoClicar) caixa.onclick = () => aoClicar(carta, caixa);
    linha.appendChild(caixa);
  }
  return linha;
}

function escolherCarta(titulo, cartas, { podePular = true } = {}) {
  return new Promise(resolve => {
    const fim = carta => { fecharModal(); resolve(carta); };
    abrirModal(titulo, linhaDeCartas(cartas, fim), podePular ? [botao('Pular', () => fim(null))] : []);
  });
}

function mostrarAjuda() {
  const sigilos = Object.values(SIGILOS).map(s => `<li>${s.icone} <b>${s.nome}</b>: ${s.desc}</li>`).join('');
  const leis = Object.values(LEIS).map(l => `<li>${l.icone} <b>${l.nome}</b>: ${l.desc}</li>`).join('');
  abrirModal('Como jogar', `
    <div class="ajuda">
      <h3>A mesa</h3>
      <ul>
        <li>Há <b>4 pistas</b>. Suas criaturas ficam embaixo, as do Guardião no meio. A fileira de cima mostra o que ele vai jogar no próximo turno.</li>
        <li>Ao <b>tocar o sino</b>, cada criatura sua ataca a pista da frente. Depois, as dele atacam você.</li>
        <li>O dano que ninguém bloqueia vai para a <b>balança</b>. Em <b>+5</b> você vence. Em <b>−5</b> uma <b>vela</b> se apaga e a batalha recomeça. Sem velas, fim de jogo.</li>
      </ul>
      <h3>Custos</h3>
      <ul>
        <li>🩸 <b>Sangue</b>: sacrifique suas criaturas da mesa (clique nelas).</li>
        <li>🦴 <b>Ossos</b>: você ganha 1 sempre que uma criatura sua morre.</li>
        <li><b>MP</b>: enche a cada turno e cresce até 6. Usado por magias e magos.</li>
        <li>Todo turno você compra do <b>baralho</b> ou pega uma <b>Alma Perdida</b> (grátis, ótima para sacrificar).</li>
      </ul>
      <h3>⚡ Limite — ${LIMITE.nome}</h3>
      <p>${LIMITE.desc}</p>
      <h3>Sigilos</h3><ul>${sigilos}</ul>
      <h3>Leis da mesa</h3>
      <p>Em algumas batalhas o Guardião muda as regras. A lei ativa fica sempre escrita acima do tabuleiro.</p>
      <ul>${leis}</ul>
      <h3>Truques do Guardião</h3>
      <p>Uma vez por batalha ele pode trapacear: roubar uma carta, apagar as luzes ou propor um acordo. Fique atento.</p>
    </div>`, [botao('Entendi', fecharModal)]);
}

// ---------- Início ----------

function carregarAlma() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_ALMA));
  } catch {
    return null;
  }
}

function novoJogo(nome) {
  jogo = {
    nome,
    deck: DECK_INICIAL.map(id => instanciar(id)),
    velas: MAX_VELAS,
    dentes: 0,
    regiao: 0,
    passo: 0,
    batalhas: 0,
    almaAntiga: carregarAlma(),
    opcoes: null,
    dicas: new Set(),
  };
}

async function comecar() {
  som.iniciar();
  const nome = $('nome').value.trim() || 'Viajante';
  novoJogo(nome);
  mostrarTela('mapa');
  desenharMapa();
  if (jogo.almaAntiga) await falar(FALAS.bemVindo(jogo.almaAntiga.nome));
  await falarVarias(FALAS.inicio);
}

// ---------- Mapa ----------

const NOS = {
  batalha: { icone: '⚔️', nome: 'Batalha', desc: 'Vença e escolha uma carta nova.' },
  carta: { icone: '🃏', nome: 'Cartas esquecidas', desc: 'Escolha 1 entre 3 cartas.' },
  fogueira: { icone: '🔥', nome: 'Fogueira', desc: 'Fortaleça cartas. Insistir é perigoso.' },
  altar: { icone: '🩸', nome: 'Altar', desc: 'Sacrifique uma carta e passe os sigilos dela a outra.' },
  mercador: { icone: '🦷', nome: 'Mercador', desc: 'Troque dentes por cartas.' },
  cristal: { icone: '💎', nome: 'Fragmento de cristal', desc: 'Reacende uma vela.' },
  bau: { icone: '📦', nome: 'Baú', desc: 'Pode ter uma invocação rara... ou dentes.' },
  dados: { icone: '🎲', nome: 'Dados do Guardião', desc: 'Aposte dentes. O maior número vence.' },
  espelho: { icone: '🪞', nome: 'Espelho rachado', desc: 'Copia uma criatura, com 1 de vida a menos.' },
  chefe: { icone: '👹', nome: 'Demônio do cristal', desc: 'Chefe com duas fases e uma lei própria.' },
};

function gerarOpcoes() {
  if (jogo.passo === PASSOS_POR_REGIAO) return ['chefe'];
  const eventos = ['carta', 'fogueira', 'altar', 'mercador', 'bau', 'dados', 'espelho'];
  if (jogo.velas < MAX_VELAS) eventos.push('cristal', 'cristal');
  const [a, b] = embaralhar(eventos);
  // Às vezes o caminho se divide em três.
  return embaralhar(Math.random() < 0.35 ? ['batalha', a, b] : ['batalha', a]);
}

function desenharMapa() {
  const regiao = REGIOES[Math.min(jogo.regiao, REGIOES.length - 1)];
  document.documentElement.style.setProperty('--cor-regiao', regiao.cor);
  $('cristais').innerHTML = REGIOES.map((r, i) =>
    `<div class="cristal${i < jogo.regiao ? ' puro' : ''}${i === jogo.regiao ? ' atual' : ''}" style="--cor:${r.cor}">
      <span>◆</span><small>${r.cristal}</small></div>`).join('');

  const trilha = [];
  for (let p = 0; p <= PASSOS_POR_REGIAO; p++) {
    const classe = p < jogo.passo ? 'feito' : p === jogo.passo ? 'atual' : '';
    trilha.push(`<span class="no ${classe}">${p === PASSOS_POR_REGIAO ? '👹' : '•'}</span>`);
  }
  $('trilha').innerHTML = trilha.join('<span class="caminho"></span>');
  $('mapa-titulo').textContent = `Ruínas do Cristal da ${regiao.cristal}`;

  jogo.opcoes ??= gerarOpcoes();
  const escolhas = $('escolhas');
  escolhas.innerHTML = '';
  if (jogo.regiao < REGIOES.length) {
    for (const tipo of jogo.opcoes) {
      const b = document.createElement('button');
      b.className = 'escolha';
      b.innerHTML = `<span class="icone">${NOS[tipo].icone}</span><span>${NOS[tipo].nome}</span><small>${NOS[tipo].desc}</small>`;
      b.onclick = () => visitar(tipo);
      escolhas.appendChild(b);
    }
  }
  atualizarHud();
}

async function visitar(tipo) {
  $('escolhas').innerHTML = '';
  const continuar = await EVENTOS[tipo]();
  if (!continuar) return;
  jogo.passo++;
  jogo.opcoes = null;
  if (jogo.passo > PASSOS_POR_REGIAO) {
    jogo.regiao++;
    jogo.passo = 0;
    if (jogo.regiao === REGIOES.length) return vencerJogo();
  }
  mostrarTela('mapa');
  desenharMapa();
}

// ---------- Eventos do mapa ----------

function sortearRecompensas(qtd, chanceRara = 0.1) {
  const ids = new Set();
  while (ids.size < qtd) {
    const r = Math.random();
    const grupo = r < chanceRara ? RECOMPENSAS.raro : r < 0.35 ? RECOMPENSAS.magia : RECOMPENSAS.comum;
    ids.add(sortear(grupo));
  }
  return [...ids].map(id => instanciar(id));
}

async function recompensaCarta(titulo = 'Escolha uma carta para o seu baralho', chanceRara) {
  const carta = await escolherCarta(titulo, sortearRecompensas(3, chanceRara));
  if (carta) jogo.deck.push(carta);
  atualizarHud();
}

// Leis: nenhuma na primeira batalha, às vezes no começo, sempre depois.
function sortearLei() {
  if (jogo.batalhas === 0) return null;
  if (jogo.regiao === 0 && Math.random() < 0.5) return null;
  return sortear(Object.keys(LEIS));
}

async function lutar(cfg) {
  mostrarTela('batalha');
  jogo.batalhas++;
  for (;;) {
    const resultado = await new Batalha(jogo, cfg).jogar();
    if (resultado.vitoria) return true;
    jogo.velas--;
    som.vela();
    tremer();
    atualizarHud();
    if (jogo.velas <= 0) {
      await perderJogo();
      return false;
    }
    await falar(sortear(FALAS.vela));
    cfg = { ...cfg, fala: null };
  }
}

const criaturas = () => jogo.deck.filter(c => c.tipo !== 'magia');

function cfgBase() {
  return {
    pool: REGIOES[jogo.regiao].pool,
    nivel: jogo.regiao,
    lei: sortearLei(),
    trapaca: jogo.batalhas > 0,
    fala: sortear(FALAS.batalha),
  };
}

const EVENTOS = {
  async batalha() {
    const cfg = cfgBase();
    if (jogo.almaAntiga && Math.random() < 0.4) {
      cfg.almaInimiga = jogo.almaAntiga;
      cfg.fala = FALAS.alma;
      jogo.almaAntiga = null;
    }
    if (!(await lutar(cfg))) return false;
    mostrarTela('mapa');
    await recompensaCarta();
    return true;
  },

  async chefe() {
    const regiao = REGIOES[jogo.regiao];
    const cfg = {
      ...cfgBase(),
      chefe: regiao.chefe,
      lei: regiao.lei,
      trapaca: true,
      fala: FALAS.chefe(CARTAS[regiao.chefe].nome),
    };
    if (!(await lutar(cfg))) return false;
    mostrarTela('mapa');
    await falar(FALAS.purificado(regiao.cristal));
    const raras = embaralhar([...RECOMPENSAS.raro]).slice(0, 3).map(id => instanciar(id));
    const carta = await escolherCarta('O cristal oferece uma invocação', raras);
    if (carta) jogo.deck.push(carta);
    jogo.velas = MAX_VELAS;
    return true;
  },

  async carta() {
    await recompensaCarta('Cartas esquecidas sobre a mesa', 0.15);
    return true;
  },

  async cristal() {
    await falar(FALAS.cristal);
    jogo.velas = Math.min(MAX_VELAS, jogo.velas + 1);
    som.magia();
    atualizarHud();
    return true;
  },

  async bau() {
    await falar(FALAS.bau);
    const abrir = await escolherOpcao('Um baú na escuridão', [['Abrir', true, 'principal'], ['Deixar quieto', false]],
      'Pode conter uma invocação rara. Ou pode não ser um baú.');
    if (!abrir) return true;
    if (Math.random() < 0.5) {
      tremer();
      som.apagao();
      await falar(FALAS.mimico);
      const cfg = { ...cfgBase(), inicial: ['mimico'], lei: null, trapaca: false, fala: null };
      if (!(await lutar(cfg))) return false;
      mostrarTela('mapa');
    } else {
      await falar(FALAS.bauAberto);
    }
    const raras = embaralhar([...RECOMPENSAS.raro]).slice(0, 2).map(id => instanciar(id));
    const carta = await escolherCarta('Dentro do baú', raras);
    if (carta) jogo.deck.push(carta);
    jogo.dentes += 2;
    atualizarHud();
    return true;
  },

  async dados() {
    await falar(FALAS.dados);
    let apostaCarta = null;
    let aposta = 0;
    if (jogo.dentes === 0) {
      await falar(FALAS.semDentes);
      const opcoes = criaturas().filter(c => c.id !== 'alma');
      if (!opcoes.length) return true;
      apostaCarta = sortear(opcoes);
      const aceitar = await escolherOpcao('Aposta', [['Apostar', true, 'principal'], ['Recusar', false]],
        linhaDeCartas([apostaCarta], null, () => 'Se perder, ele fica com esta carta. Se ganhar, você leva uma invocação.'));
      if (!aceitar) return true;
    } else {
      const valores = [...new Set([1, Math.ceil(jogo.dentes / 2), jogo.dentes])];
      aposta = await escolherOpcao(`Você tem ${jogo.dentes} 🦷. Quanto aposta?`,
        [...valores.map(v => [`${v} 🦷`, v]), ['Não jogar', 0]],
        'Cada um rola um dado de 6 lados. Se o seu for maior, você ganha o dobro. Empate ou menor: ele fica com a aposta.');
      if (!aposta) return true;
    }
    const meu = 1 + Math.floor(Math.random() * 6);
    const dele = 1 + Math.floor(Math.random() * 6);
    for (let i = 0; i < 6; i++) { som.dado(); await esperar(90); }
    const ganhou = meu > dele;
    const placar = `Você tirou ${meu}. Ele tirou ${dele}.`;
    if (apostaCarta) {
      if (ganhou) {
        const rara = instanciar(sortear(RECOMPENSAS.raro));
        jogo.deck.push(rara);
        await falar(`${placar} Tome. ${rara.nome} é seu.`);
      } else {
        jogo.deck = jogo.deck.filter(c => c !== apostaCarta);
        await falar(`${placar} ${apostaCarta.nome} agora mora no meu baralho.`);
      }
    } else {
      jogo.dentes += ganhou ? aposta : -aposta;
      await falar(ganhou ? `${placar} Hmpf. Pegue seus dentes.` : `${placar} Seus dentes são meus.`);
    }
    atualizarHud();
    return true;
  },

  async espelho() {
    await falar(FALAS.espelhoNo);
    const carta = await escolherCarta('Qual criatura olha para o espelho?', criaturas());
    if (!carta) return true;
    const reflexo = clonar(carta);
    reflexo.nome = `Reflexo de ${carta.nome}`;
    reflexo.maxHp = Math.max(1, carta.maxHp - 1);
    reflexo.hp = reflexo.maxHp;
    jogo.deck.push(reflexo);
    som.magia();
    abrirModal('O reflexo sai do espelho', linhaDeCartas([reflexo]), [botao('Seguir', fecharModal)]);
    atualizarHud();
    return true;
  },

  async fogueira() {
    falar(FALAS.fogueira);
    let visitas = 0;
    for (;;) {
      const risco = Math.round(Math.min(1, 0.3 * visitas) * 100);
      const titulo = visitas ? `Aquecer outra carta? Chance de ser devorada: ${risco}%` : 'Aproxime uma carta do fogo (a primeira é segura)';
      const carta = await escolherCarta(titulo, criaturas());
      if (!carta) return true;
      const melhoria = await escolherOpcao(carta.nome, [['+1 Ataque', 'atk'], ['+2 Vida', 'hp']], elementoCarta(carta));
      if (visitas > 0 && Math.random() < 0.3 * visitas) {
        jogo.deck = jogo.deck.filter(c => c !== carta);
        som.sacrificio();
        tremer();
        atualizarHud();
        await falar(FALAS.devorada);
        return true;
      }
      if (melhoria === 'atk') carta.atk++;
      else { carta.hp += 2; carta.maxHp += 2; }
      som.magia();
      visitas++;
    }
  },

  async altar() {
    await falar(FALAS.altar);
    const doadores = criaturas().filter(c => c.sigilos.length);
    if (!doadores.length) {
      await falar('Nenhuma das suas cartas tem um sigilo para oferecer.');
      return true;
    }
    const doador = await escolherCarta('Qual carta será sacrificada? Os sigilos dela passam para outra.', doadores);
    if (!doador) return true;
    const herdeiros = criaturas().filter(c => c !== doador && c.sigilos.length < MAX_SIGILOS);
    if (!herdeiros.length) {
      await falar('Não há quem possa receber esse sangue.');
      return true;
    }
    const herdeiro = await escolherCarta(`Quem recebe os sigilos de ${doador.nome}?`, herdeiros, { podePular: false });
    for (const s of doador.sigilos) {
      if (!herdeiro.sigilos.includes(s) && herdeiro.sigilos.length < MAX_SIGILOS) herdeiro.sigilos.push(s);
    }
    jogo.deck = jogo.deck.filter(c => c !== doador);
    som.sacrificio();
    atualizarHud();
    return true;
  },

  async mercador() {
    falar(FALAS.mercador);
    const ofertas = sortearRecompensas(4, 0.25);
    const preco = c => (c.raro ? 7 : c.tipo === 'magia' ? 4 : 3);
    return new Promise(resolve => {
      const desenhar = () => {
        const linha = linhaDeCartas(ofertas, carta => {
          if (carta.vendida || jogo.dentes < preco(carta)) return;
          jogo.dentes -= preco(carta);
          carta.vendida = true;
          jogo.deck.push(carta);
          som.carta();
          atualizarHud();
          desenhar();
        }, c => (c.vendida ? 'vendida' : `${preco(c)} 🦷`));
        abrirModal(`Mercador — você tem ${jogo.dentes} 🦷`, linha, [botao('Ir embora', () => { fecharModal(); resolve(true); })]);
      };
      desenhar();
    });
  },
};

// ---------- Fim ----------

async function perderJogo() {
  await falarVarias(FALAS.morte);
  const melhor = criaturas().sort((a, b) => b.atk + b.maxHp - (a.atk + a.maxHp))[0] ?? instanciar('cavaleiro');
  const alma = {
    nome: jogo.nome,
    arte: '🕯️',
    atk: melhor.atk,
    hp: melhor.maxHp,
    sigilos: melhor.sigilos.slice(0, 2),
    custo: {},
    alma: true,
  };
  try {
    localStorage.setItem(CHAVE_ALMA, JSON.stringify(alma));
  } catch {
    // Sem armazenamento: a alma se perde na escuridão.
  }
  $('fim-titulo').textContent = 'Você virou uma carta';
  $('fim-texto').textContent = 'O Guardião guardou seu retrato no baralho dele. Talvez vocês se reencontrem na próxima partida.';
  $('fim-carta').innerHTML = '';
  $('fim-carta').appendChild(elementoCarta(instanciar('alma-do-jogador', alma)));
  jogo = null;
  mostrarTela('fim');
}

async function vencerJogo() {
  mostrarTela('mapa');
  desenharMapa();
  await falar(FALAS.final);
  $('fim-titulo').textContent = 'A porta se abre';
  $('fim-texto').textContent = `${jogo.nome} purificou os quatro cristais e escapou da cabana. Por enquanto.`;
  $('fim-carta').innerHTML = '';
  jogo = null;
  mostrarTela('fim');
}

// ---------- Detalhes que quebram a quarta parede ----------

document.addEventListener('visibilitychange', () => {
  if (!jogo) return;
  if (document.hidden) {
    document.title = 'Volte. Eu ainda estou aqui.';
  } else {
    document.title = TITULO;
    if (Math.random() < 0.5) falar(FALAS.voltou(jogo.nome));
  }
});

// Os olhos da tela inicial seguem o cursor.
document.addEventListener('mousemove', e => {
  const dx = (e.clientX / window.innerWidth - 0.5) * 16;
  const dy = (e.clientY / window.innerHeight - 0.5) * 10;
  document.documentElement.style.setProperty('--olhar', `translate(${dx}px, ${dy}px)`);
});

const almaGuardada = carregarAlma();
if (almaGuardada) $('subtitulo').textContent = FALAS.bemVindo(almaGuardada.nome);

// ---------- Controles globais ----------

$('btn-comecar').onclick = comecar;
$('nome').addEventListener('keydown', e => { if (e.key === 'Enter') comecar(); });
$('btn-reiniciar').onclick = () => {
  $('dialogo').classList.add('oculto');
  mostrarTela('titulo');
};
$('btn-mudo').onclick = () => {
  som.iniciar();
  $('btn-mudo').textContent = som.alternarMudo() ? '🔇' : '🔊';
};
$('btn-ajuda').onclick = mostrarAjuda;
$('btn-ajuda-titulo').onclick = mostrarAjuda;
$('btn-baralho').onclick = () => {
  if (!jogo || !$('modal').classList.contains('oculto')) return;
  abrirModal('Seu baralho', linhaDeCartas(jogo.deck), [botao('Fechar', fecharModal)]);
};
