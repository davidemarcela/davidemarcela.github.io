import { CARTAS, SIGILOS } from './data.js';

export const $ = id => document.getElementById(id);
export const esperar = ms => new Promise(r => setTimeout(r, ms));
export const sortear = lista => lista[Math.floor(Math.random() * lista.length)];

export function embaralhar(lista) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

let proximoUid = 0;

export function instanciar(id, extra = {}) {
  const def = CARTAS[id] ?? extra;
  const carta = {
    ...def,
    ...extra,
    id,
    uid: proximoUid++,
    custo: { ...(def.custo ?? {}) },
    sigilos: [...(extra.sigilos ?? def.sigilos ?? [])],
  };
  carta.maxHp = carta.hp;
  return carta;
}

export function clonar(carta) {
  return { ...carta, uid: proximoUid++, custo: { ...carta.custo }, sigilos: [...carta.sigilos], hp: carta.maxHp };
}

function textoCusto(custo) {
  const partes = [];
  if (custo.sangue) partes.push('<span class="c-sangue">' + '🩸'.repeat(custo.sangue) + '</span>');
  if (custo.ossos) partes.push(`<span class="c-ossos">🦴×${custo.ossos}</span>`);
  if (custo.mp) partes.push(`<span class="c-mp">MP ${custo.mp}</span>`);
  return partes.join(' ');
}

export function descricao(carta) {
  if (carta.tipo === 'magia') return `${carta.nome}: ${carta.desc}`;
  const sig = carta.sigilos.map(s => `${SIGILOS[s].icone} ${SIGILOS[s].nome}: ${SIGILOS[s].desc}`);
  return [`${carta.nome} — ${carta.atk} ataque / ${carta.maxHp} vida`, ...sig].join('\n');
}

function explicarCusto(custo) {
  const partes = [];
  if (custo.sangue) partes.push(`sacrifique ${custo.sangue} de sangue`);
  if (custo.ossos) partes.push(`pague ${custo.ossos} ossos`);
  if (custo.mp) partes.push(`gaste ${custo.mp} MP`);
  return partes.length ? `Custo: ${partes.join(', ')}.` : 'Custo: grátis.';
}

// Texto completo de uma carta, para o painel de detalhes.
export function descricaoHTML(carta) {
  const linhas = [`<b>${carta.nome}</b>`];
  if (carta.tipo === 'magia') linhas.push(`Magia — ${carta.desc}`);
  else linhas.push(`⚔ ${carta.atk} de ataque · ♥ ${carta.hp}/${carta.maxHp} de vida`);
  linhas.push(explicarCusto(carta.custo));
  for (const s of carta.sigilos) linhas.push(`${SIGILOS[s].icone} <b>${SIGILOS[s].nome}</b>: ${SIGILOS[s].desc}`);
  if (carta.renasceu) linhas.push('<i>Já voltou da morte uma vez.</i>');
  return linhas.join('<br>');
}

export function elementoCarta(carta) {
  const el = document.createElement('div');
  el.className = 'carta';
  if (carta.tipo === 'magia') el.classList.add('magia');
  if (carta.raro) el.classList.add('rara');
  if (carta.chefe) el.classList.add('chefe');
  if (carta.alma) el.classList.add('alma-jogador');
  el.title = descricao(carta);
  const sigilos = carta.sigilos.map(s => `<span title="${SIGILOS[s].desc}">${SIGILOS[s].icone}</span>`).join('');
  const rodape = carta.tipo === 'magia'
    ? `<div class="desc-magia">${carta.desc}</div>`
    : `<div class="stats"><span class="atk">${carta.atk}</span><span class="hp${carta.hp < carta.maxHp ? ' ferido' : ''}">${carta.hp}</span></div>`;
  el.innerHTML = `
    <div class="custo">${textoCusto(carta.custo)}</div>
    <div class="nome">${carta.nome}</div>
    <div class="arte">${carta.arte}</div>
    <div class="sigilos">${sigilos}</div>
    ${rodape}`;
  return el;
}

// ---------- Janelas ----------

export function abrirModal(titulo, conteudo, acoes) {
  $('modal-titulo').textContent = titulo;
  const area = $('modal-conteudo');
  area.innerHTML = '';
  if (typeof conteudo === 'string') area.innerHTML = conteudo;
  else if (conteudo) area.appendChild(conteudo);
  const botoes = $('modal-acoes');
  botoes.innerHTML = '';
  for (const acao of acoes) botoes.appendChild(acao);
  $('modal').classList.remove('oculto');
}

export function fecharModal() {
  $('modal').classList.add('oculto');
}

export function botao(rotulo, aoClicar, classe = '') {
  const b = document.createElement('button');
  b.textContent = rotulo;
  b.className = classe;
  b.onclick = aoClicar;
  return b;
}

export function escolherOpcao(titulo, opcoes, conteudo = null) {
  return new Promise(resolve => {
    const fim = valor => { fecharModal(); resolve(valor); };
    abrirModal(titulo, conteudo, opcoes.map(([rotulo, valor, classe]) => botao(rotulo, () => fim(valor), classe)));
  });
}

// Fala do Guardião, letra por letra. Clique na caixa para pular.
let falaAtual = 0;
export async function falar(texto) {
  const id = ++falaAtual;
  const caixa = $('dialogo');
  const alvo = $('dialogo-texto');
  caixa.classList.remove('oculto');
  alvo.textContent = '';
  let pular = false;
  const aoClicar = () => { pular = true; };
  caixa.addEventListener('click', aoClicar);
  for (const letra of texto) {
    if (id !== falaAtual) return;
    if (pular) { alvo.textContent = texto; break; }
    alvo.textContent += letra;
    som.voz();
    await esperar(32);
  }
  if (!pular) await esperar(700);
  caixa.removeEventListener('click', aoClicar);
}

export async function falarVarias(linhas) {
  for (const linha of linhas) await falar(linha);
}

export function tremer() {
  document.body.classList.remove('tremor');
  void document.body.offsetWidth;
  document.body.classList.add('tremor');
}

// Sons sintetizados com Web Audio (sem arquivos externos).
let ctx = null;
let mudo = false;

function tom({ freq = 440, fim = freq, dur = 0.2, tipo = 'sine', vol = 0.15, ruido = false }) {
  if (!ctx || mudo) return;
  const agora = ctx.currentTime;
  const ganho = ctx.createGain();
  ganho.gain.setValueAtTime(vol, agora);
  ganho.gain.exponentialRampToValueAtTime(0.0001, agora + dur);
  ganho.connect(ctx.destination);
  if (ruido) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const dados = buffer.getChannelData(0);
    for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
    const fonte = ctx.createBufferSource();
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = freq;
    fonte.buffer = buffer;
    fonte.connect(filtro).connect(ganho);
    fonte.start();
    return;
  }
  const osc = ctx.createOscillator();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, agora);
  osc.frequency.exponentialRampToValueAtTime(fim, agora + dur);
  osc.connect(ganho);
  osc.start();
  osc.stop(agora + dur);
}

export const som = {
  iniciar() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return;
    }
    // Zumbido grave e constante da cabana.
    const ganho = ctx.createGain();
    ganho.gain.value = 0.025;
    ganho.connect(ctx.destination);
    for (const f of [55, 55.7, 82.4]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      const filtro = ctx.createBiquadFilter();
      filtro.type = 'lowpass';
      filtro.frequency.value = 180;
      osc.connect(filtro).connect(ganho);
      osc.start();
    }
    this.ganhoDrone = ganho;
  },
  alternarMudo() {
    mudo = !mudo;
    if (this.ganhoDrone) this.ganhoDrone.gain.value = mudo ? 0 : 0.025;
    return mudo;
  },
  sino: () => { tom({ freq: 660, dur: 1.4, vol: 0.12 }); tom({ freq: 1320, dur: 0.9, vol: 0.05 }); },
  golpe: () => tom({ freq: 300, dur: 0.25, vol: 0.4, ruido: true }),
  sacrificio: () => tom({ freq: 220, fim: 55, dur: 0.7, tipo: 'triangle', vol: 0.2 }),
  magia: () => tom({ freq: 400, fim: 1600, dur: 0.4, tipo: 'triangle', vol: 0.1 }),
  carta: () => tom({ freq: 1800, dur: 0.08, vol: 0.1, ruido: true }),
  voz: () => tom({ freq: 90 + Math.random() * 30, dur: 0.05, tipo: 'square', vol: 0.025 }),
  vela: () => tom({ freq: 800, dur: 0.6, vol: 0.2, ruido: true }),
  apagao: () => { tom({ freq: 120, fim: 40, dur: 1.5, tipo: 'sawtooth', vol: 0.15 }); tom({ freq: 2000, dur: 0.3, vol: 0.2, ruido: true }); },
  limite: () => { tom({ freq: 220, fim: 880, dur: 0.6, tipo: 'square', vol: 0.08 }); tom({ freq: 330, fim: 1320, dur: 0.8, tipo: 'triangle', vol: 0.1 }); },
  dado: () => tom({ freq: 900, dur: 0.15, vol: 0.2, ruido: true }),
};
