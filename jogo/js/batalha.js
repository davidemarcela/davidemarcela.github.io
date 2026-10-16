import { FALAS, LEIS, LIMITE as LIMITE_INFO, RECOMPENSAS } from './data.js';
import {
  $, esperar, sortear, embaralhar, instanciar, clonar, elementoCarta, descricaoHTML,
  falar, tremer, som, escolherOpcao,
} from './util.js';

const PISTAS = 4;
const LIMITE = 5;
const MP_MAXIMO = 6;
const ALMAS_POR_BATALHA = 10;

const valorSangue = carta => (carta.sigilos.includes('digno') ? 3 : 1);

// Uma batalha na mesa do Guardião.
// cfg = { pool, nivel, chefe?, inicial?, almaInimiga?, fala?, lei?, trapaca? }
export class Batalha {
  constructor(jogo, cfg) {
    this.jogo = jogo;
    this.cfg = cfg;
    this.lei = cfg.lei ?? null;
  }

  jogar() {
    return new Promise(resolve => {
      this.resolver = resolve;
      this.iniciar();
    });
  }

  async iniciar() {
    Object.assign(this, {
      baralho: embaralhar(this.jogo.deck.map(clonar)),
      almas: ALMAS_POR_BATALHA,
      mao: [],
      jogador: Array(PISTAS).fill(null),
      inimigo: Array(PISTAS).fill(null),
      fila: Array(PISTAS).fill(null),
      balanca: this.lei === 'viciada' ? -2 : 0,
      ossos: 0,
      mp: this.lei === 'eclipse' ? 3 : 1,
      mpMax: this.lei === 'eclipse' ? 3 : 1,
      turno: 1,
      fase: 1,
      limite: 0,
      mortos: [],
      selecionada: null,
      inspecionada: null,
      sacrificios: new Set(),
      sangue: 0,
      efeitos: new Map(),
      espelhoUsado: false,
      turnoTrapaca: this.cfg.trapaca ? 3 + Math.floor(Math.random() * 3) : -1,
      modo: 'animando',
      terminou: false,
    });
    this.ligarControles();

    for (let i = 0; i < 3 && this.baralho.length; i++) this.mao.push(this.baralho.pop());
    this.mao.push(instanciar('alma'));
    this.almas--;

    if (this.cfg.chefe) this.fila[1] = this.criarInimigo(this.cfg.chefe);
    for (const id of this.cfg.inicial ?? []) this.colocarNaFila(this.criarInimigo(id));
    if (this.cfg.almaInimiga) this.colocarNaFila(instanciar('alma-do-jogador', this.cfg.almaInimiga));
    this.planejarInimigo();
    this.avancarFila();
    this.planejarInimigo();
    this.render();

    await this.dica('inicio');
    if (this.cfg.fala) await falar(this.cfg.fala);
    if (this.lei) {
      await this.dica('lei', 'Às vezes eu mudo as regras. A lei desta mesa fica escrita ali em cima.');
      await falar(FALAS.lei(LEIS[this.lei]));
    }
    await this.dica('detalhe');
    this.modo = 'jogar';
    this.render();
  }

  ligarControles() {
    $('sino').onclick = () => this.tocarSino();
    $('btn-limite').onclick = () => this.usarLimite();
    $('pilha-baralho').onclick = () => this.comprar('baralho');
    $('pilha-almas').onclick = () => this.comprar('almas');
  }

  // Ensina cada mecânica uma única vez por partida.
  async dica(chave, texto = FALAS.dicas[chave]) {
    if (this.jogo.dicas.has(chave)) return;
    this.jogo.dicas.add(chave);
    await falar(texto);
  }

  criarInimigo(id, reforco = 0) {
    const carta = instanciar(id);
    const nivel = this.cfg.nivel + reforco;
    carta.atk += Math.floor(nivel / 2);
    carta.hp += nivel;
    carta.maxHp = carta.hp;
    return carta;
  }

  colocarNaFila(carta) {
    const livre = this.fila.findIndex(x => !x);
    if (livre >= 0) this.fila[livre] = carta;
    return livre >= 0;
  }

  planejarInimigo() {
    let qtd = 1;
    if (this.cfg.nivel >= 1 && this.turno % 2 === 0) qtd++;
    if (this.fase === 2) qtd++;
    if (this.turno >= 10) qtd++;
    const livres = embaralhar(this.fila.map((c, i) => (c ? -1 : i)).filter(i => i >= 0));
    for (const i of livres.slice(0, qtd)) this.fila[i] = this.criarInimigo(sortear(this.cfg.pool));
  }

  avancarFila() {
    for (let i = 0; i < PISTAS; i++) {
      if (!this.inimigo[i] && this.fila[i]) {
        this.inimigo[i] = this.fila[i];
        this.fila[i] = null;
      }
    }
  }

  ganharLimite(qtd = 1) {
    const antes = this.limite;
    this.limite = Math.min(LIMITE_INFO.max, this.limite + qtd);
    if (antes < LIMITE_INFO.max && this.limite === LIMITE_INFO.max) this.dica('limite');
  }

  // ---------- Ações do jogador ----------

  async comprar(pilha) {
    if (this.modo !== 'comprar') return;
    if (pilha === 'baralho' && this.baralho.length) this.mao.push(this.baralho.pop());
    else if (pilha === 'almas' && this.almas > 0) {
      this.mao.push(instanciar('alma'));
      this.almas--;
    } else return;
    som.carta();
    this.modo = 'jogar';
    this.render();
  }

  motivoParaNaoJogar(carta) {
    const custo = carta.custo;
    if ((custo.ossos ?? 0) > this.ossos) return `Você precisa de ${custo.ossos} ossos. Ossos vêm das suas criaturas que morrem.`;
    if ((custo.mp ?? 0) > this.mp) return `Você precisa de ${custo.mp} MP. O MP enche a cada turno.`;
    if (carta.tipo === 'magia') {
      const temInimigo = this.inimigo.some(Boolean);
      if ((carta.alvo === 'inimigo' || carta.alvo === 'todos') && !temInimigo) return 'Não há inimigos na mesa para atingir.';
      if (carta.alvo === 'aliado' && !this.jogador.some(Boolean)) return 'Não há aliados na mesa para curar.';
      if (carta.reviver && !this.mortos.length) return 'Nenhuma criatura sua morreu ainda.';
      return null;
    }
    if (custo.sangue) {
      const disponivel = this.jogador.reduce((s, c) => s + (c ? valorSangue(c) : 0), 0);
      if (disponivel < custo.sangue) {
        return `Essa carta pede ${custo.sangue} de sangue, mas você só tem ${disponivel} criatura(s) para sacrificar. Jogue Almas Perdidas primeiro.`;
      }
    } else if (this.jogador.every(Boolean)) {
      return 'Não há espaço livre na sua fileira.';
    }
    return null;
  }

  async clicarMao(carta) {
    this.inspecionada = carta;
    if (this.modo !== 'jogar' || this.sangue > 0) return this.render();
    if (this.selecionada === carta) {
      this.selecionada = null;
      this.sacrificios.clear();
      this.render();
      return;
    }
    const motivo = this.motivoParaNaoJogar(carta);
    if (motivo) {
      this.render();
      falar(motivo);
      return;
    }
    this.selecionada = carta;
    this.sacrificios.clear();
    this.render();
    if (carta.custo.sangue) this.dica('sangue');
    if (carta.tipo === 'magia' && (carta.alvo === 'todos' || carta.alvo === 'nenhum')) await this.lancarMagia(null);
  }

  async clicarJogador(i) {
    const carta = this.selecionada;
    if (!carta || this.modo !== 'jogar') {
      this.inspecionar(this.jogador[i]);
      return;
    }
    if (carta.tipo === 'magia') {
      if (carta.alvo === 'aliado' && this.jogador[i]) await this.lancarMagia(i);
      return;
    }
    const precisa = carta.custo.sangue ?? 0;
    if (this.sangue < precisa) {
      if (!this.jogador[i]) return;
      if (this.sacrificios.has(i)) this.sacrificios.delete(i);
      else this.sacrificios.add(i);
      const soma = [...this.sacrificios].reduce((s, j) => s + valorSangue(this.jogador[j]), 0);
      if (soma >= precisa) {
        this.modo = 'animando';
        for (const j of this.sacrificios) await this.sacrificar(j);
        this.sacrificios.clear();
        this.sangue = precisa;
        this.modo = 'jogar';
      }
      this.render();
      return;
    }
    if (!this.jogador[i]) await this.colocar(carta, i);
  }

  async clicarInimigo(i) {
    const carta = this.selecionada;
    if (this.modo === 'jogar' && carta?.tipo === 'magia' && carta.alvo === 'inimigo' && this.inimigo[i]) {
      await this.lancarMagia(i);
      return;
    }
    this.inspecionar(this.inimigo[i]);
  }

  inspecionar(carta) {
    if (!carta || (this.lei === 'nevoa' && this.fila.includes(carta))) return;
    this.inspecionada = carta;
    this.render();
  }

  pagar(carta) {
    this.ossos -= carta.custo.ossos ?? 0;
    this.mp -= carta.custo.mp ?? 0;
    this.mao = this.mao.filter(c => c !== carta);
    this.selecionada = null;
    this.sangue = 0;
  }

  async colocar(carta, i) {
    this.modo = 'animando';
    this.pagar(carta);
    this.jogador[i] = carta;
    som.carta();
    await this.animar('jogador', i, 'entrando', 250);
    await this.efeitosDeEntrada(carta, i);
    this.modo = 'jogar';
    this.render();
    this.dica('sino');
  }

  async efeitosDeEntrada(carta, i) {
    if (carta.sigilos.includes('feitico') && this.inimigo[i]) {
      som.magia();
      await this.ferir('inimigo', i, 2);
    }
    if (carta.sigilos.includes('corte') && this.inimigo[i]) {
      som.magia();
      await this.ferir('inimigo', i, this.inimigo[i].hp);
    }
    if (carta.sigilos.includes('nevasca')) {
      som.magia();
      for (let j = 0; j < PISTAS; j++) await this.ferir('inimigo', j, 1);
    }
  }

  async lancarMagia(i) {
    const carta = this.selecionada;
    this.modo = 'animando';
    this.pagar(carta);
    som.magia();
    if (carta.alvo === 'inimigo') await this.ferir('inimigo', i, carta.dano);
    if (carta.alvo === 'todos') {
      for (let j = 0; j < PISTAS; j++) await this.ferir('inimigo', j, carta.dano);
    }
    if (carta.cura) {
      const alvo = this.jogador[i];
      alvo.hp = Math.min(alvo.maxHp, alvo.hp + carta.cura);
      await this.animar('jogador', i, 'curada', 400);
    }
    if (carta.reviver) {
      const morto = this.mortos.pop();
      this.mao.push(clonar(morto));
      falar(`${morto.nome} rasteja de volta para a sua mão.`);
    }
    this.modo = 'jogar';
    this.render();
  }

  async sacrificar(i) {
    som.sacrificio();
    await this.animar('jogador', i, 'sacrificada', 450);
    this.morrer('jogador', i);
    if (this.lei === 'lua') this.ossos++;
    this.ganharLimite();
  }

  async usarLimite() {
    if (this.modo !== 'jogar' || this.sangue > 0 || this.limite < LIMITE_INFO.max) return;
    if (!this.jogador.some(c => c && c.atk + 1 > 0)) {
      falar('Você precisa de criaturas na mesa para usar o Juízo Final.');
      return;
    }
    this.modo = 'animando';
    this.limite = 0;
    this.selecionada = null;
    som.limite();
    document.body.classList.add('juizo');
    falar(FALAS.limite);
    await esperar(500);
    await this.ataque('jogador', 1);
    document.body.classList.remove('juizo');
    if (await this.verificarFim()) return;
    this.modo = 'jogar';
    this.render();
  }

  // ---------- Combate ----------

  async animar(lado, i, classe, ms) {
    const chave = `${lado}-${i}`;
    this.efeitos.set(chave, classe);
    this.render();
    await esperar(ms);
    this.efeitos.delete(chave);
  }

  async ferir(lado, i, dano) {
    const carta = this[lado][i];
    if (!carta) return;
    carta.hp -= dano;
    som.golpe();
    if (lado === 'jogador') this.ganharLimite();
    await this.animar(lado, i, 'ferida', 300);
    if (carta.hp <= 0) this.morrer(lado, i);
    this.render();
  }

  morrer(lado, i) {
    const carta = this[lado][i];
    this[lado][i] = null;
    if (this.inspecionada === carta) this.inspecionada = null;
    const volta = carta.sigilos.includes('renasce') && !carta.renasceu;
    if (lado === 'jogador') {
      this.ossos++;
      if (volta) this.mao.push({ ...clonar(carta), renasceu: true });
      else if (carta.id !== 'alma') this.mortos.push(carta);
      return;
    }
    if (volta && !this.fila[i]) {
      this.fila[i] = { ...clonar(carta), renasceu: true };
    } else if (this.lei === 'espelho' && !this.espelhoUsado && !carta.chefe) {
      this.espelhoUsado = true;
      this.mao.push({ ...clonar(carta), custo: {} });
      falar(FALAS.espelho(carta.nome));
    }
  }

  async ataque(lado, bonus = 0) {
    const outro = lado === 'jogador' ? 'inimigo' : 'jogador';
    const sinal = lado === 'jogador' ? 1 : -1;
    for (let i = 0; i < PISTAS; i++) {
      const atacante = this[lado][i];
      const forca = atacante ? atacante.atk + bonus : 0;
      if (forca <= 0) continue;
      await this.animar(lado, i, `ataca-${lado}`, 220);
      const alvo = this[outro][i];
      if (!alvo || atacante.sigilos.includes('salto')) {
        this.balanca += sinal * forca;
        som.golpe();
        if (lado === 'inimigo') tremer();
        this.render();
        await this.dica('balanca');
      } else {
        const dano = atacante.sigilos.includes('veneno') ? alvo.hp : forca;
        const espinhos = alvo.sigilos.includes('espinhos');
        await this.ferir(outro, i, dano);
        if (espinhos) await this.ferir(lado, i, 1);
      }
      if (lado === 'jogador' && atacante.sigilos.includes('dreno')) this.mp = Math.min(this.mpMax, this.mp + 1);
      this.render();
      if (Math.abs(this.balanca) >= LIMITE) break;
    }
  }

  async tocarSino() {
    if (this.modo !== 'jogar' || this.sangue > 0) return;
    this.modo = 'animando';
    this.selecionada = null;
    this.sacrificios.clear();
    som.sino();
    this.render();

    await this.ataque('jogador');
    if (await this.verificarFim()) return;
    await esperar(300);
    this.avancarFila();
    this.render();
    await esperar(300);
    await this.ataque('inimigo');
    if (await this.verificarFim()) return;

    if (this.lei === 'mare') await this.mare();
    if (this.lei === 'velaCurta' && this.turno >= 8) {
      this.balanca--;
      tremer();
      this.render();
      await falar(FALAS.velaCurta);
      if (await this.verificarFim()) return;
    }
    await this.novoTurno();
  }

  async mare() {
    const girar = linha => linha.unshift(linha.pop());
    girar(this.jogador);
    girar(this.inimigo);
    girar(this.fila);
    this.render();
    document.body.classList.add('onda');
    await falar(FALAS.mare);
    document.body.classList.remove('onda');
  }

  async novoTurno() {
    this.turno++;
    this.planejarInimigo();
    if (this.lei !== 'eclipse') this.mpMax = Math.min(MP_MAXIMO, this.mpMax + 1);
    this.mp = this.mpMax;
    this.jogador.forEach((carta, i) => {
      if (!carta?.sigilos.includes('cura')) return;
      for (const j of [i - 1, i + 1]) {
        const vizinho = this.jogador[j];
        if (vizinho) vizinho.hp = Math.min(vizinho.maxHp, vizinho.hp + 1);
      }
    });
    if (this.lei === 'caos' && this.mao.length) {
      const i = Math.floor(Math.random() * this.mao.length);
      this.mao[i] = instanciar(sortear([...RECOMPENSAS.comum, ...RECOMPENSAS.magia]));
      this.render();
      await falar(FALAS.caos);
    }
    if (this.turno === this.turnoTrapaca) {
      await this.trapaca();
      if (this.terminou) return;
    }
    this.modo = this.baralho.length || this.almas ? 'comprar' : 'jogar';
    this.render();
    if (this.modo === 'comprar') this.dica('comprar');
    else if (this.turno % 4 === 0) falar(sortear(FALAS.batalha));
  }

  // O Guardião trapaceia uma vez por batalha, de um jeito diferente a cada vez.
  async trapaca() {
    const opcoes = ['apagao'];
    if (this.mao.some(c => c.id !== 'alma') && this.fila.some(x => !x)) opcoes.push('roubo');
    if (this.jogo.velas >= 2 && this.balanca < 0) opcoes.push('acordo', 'acordo');
    const tipo = sortear(opcoes);

    if (tipo === 'roubo') {
      const custoTotal = c => (c.custo.sangue ?? 0) * 3 + (c.custo.ossos ?? 0) + (c.custo.mp ?? 0);
      const alvo = this.mao.filter(c => c.id !== 'alma').sort((a, b) => custoTotal(b) - custoTotal(a))[0];
      this.mao = this.mao.filter(c => c !== alvo);
      if (alvo.tipo === 'magia') {
        await falar(`${alvo.nome}? Isso não serve pra você. Vou queimar.`);
      } else {
        this.colocarNaFila({ ...alvo, hp: alvo.maxHp });
        this.render();
        await falar(FALAS.roubo(alvo.nome));
      }
    } else if (tipo === 'apagao') {
      som.apagao();
      document.body.classList.add('apagao');
      await esperar(1600);
      const candidatos = [...this.inimigo, ...this.fila].filter(Boolean);
      const alvo = sortear(candidatos);
      if (alvo) {
        alvo.atk++;
        alvo.hp++;
        alvo.maxHp++;
      }
      document.body.classList.remove('apagao');
      this.render();
      await falar(FALAS.apagao);
      if (alvo) await falar(FALAS.apagaoDepois(alvo.nome));
    } else {
      await falar(FALAS.acordo);
      const aceitou = await escolherOpcao('O acordo do Guardião', [
        ['Aceitar (−1 vela, vencer agora)', true, 'principal'],
        ['Recusar', false],
      ], 'Se aceitar, uma das suas velas se apaga e você vence esta batalha imediatamente.');
      if (aceitou) {
        this.jogo.velas--;
        som.vela();
        await falar(FALAS.acordoAceito);
        this.balanca = LIMITE;
        this.fase = 2;
        await this.verificarFim();
      } else {
        await falar(FALAS.acordoRecusado);
      }
    }
  }

  async verificarFim() {
    if (this.balanca >= LIMITE) {
      if (this.cfg.chefe && this.fase === 1) {
        await this.segundaFase();
        return true;
      }
      this.terminou = true;
      const dentes = 1 + this.balanca - LIMITE + (this.lei === 'viciada' ? 3 : 0);
      this.jogo.dentes += dentes;
      this.render();
      await falar(`${sortear(FALAS.vitoria)} (+${dentes} 🦷)`);
      this.resolver({ vitoria: true });
      return true;
    }
    if (this.balanca <= -LIMITE) {
      this.terminou = true;
      this.resolver({ vitoria: false });
      return true;
    }
    return false;
  }

  async segundaFase() {
    tremer();
    await falar(FALAS.fase2);
    this.fase = 2;
    this.balanca = 0;
    this.inimigo.fill(null);
    this.fila.fill(null);
    const chefe = this.criarInimigo(this.cfg.chefe, 1);
    chefe.atk++;
    this.fila[1] = chefe;
    this.avancarFila();
    await this.novoTurno();
  }

  // ---------- Desenho ----------

  instrucao() {
    if (this.modo === 'comprar') return 'Compre uma carta: do seu baralho ou uma Alma Perdida.';
    if (this.modo === 'animando') return '';
    const carta = this.selecionada;
    if (!carta) return 'Escolha uma carta da mão, ou toque o sino para atacar.';
    if (carta.tipo === 'magia') {
      return carta.alvo === 'aliado' ? 'Escolha um aliado para curar.' : 'Escolha um inimigo como alvo.';
    }
    const precisa = carta.custo.sangue ?? 0;
    if (this.sangue < precisa) return `Sacrifique ${precisa} de sangue: clique nas suas criaturas na mesa.`;
    return 'Escolha um espaço vazio na sua fileira.';
  }

  slotAtivo(lado, i) {
    const carta = this.selecionada;
    if (this.modo !== 'jogar' || !carta) return false;
    const ocupado = Boolean(this[lado][i]);
    if (carta.tipo === 'magia') {
      return (carta.alvo === 'inimigo' && lado === 'inimigo' && ocupado)
        || (carta.alvo === 'aliado' && lado === 'jogador' && ocupado);
    }
    if (lado !== 'jogador') return false;
    return this.sangue < (carta.custo.sangue ?? 0) ? ocupado : !ocupado;
  }

  desenharLinha(lado, elemento, aoClicar) {
    elemento.innerHTML = '';
    this[lado].forEach((carta, i) => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      if (carta && lado === 'fila' && this.lei === 'nevoa') {
        slot.innerHTML = '<div class="carta virada">?</div>';
      } else if (carta) {
        const el = elementoCarta(carta);
        el.onmouseenter = () => this.mostrarDetalhe(carta);
        slot.appendChild(el);
      }
      const efeito = this.efeitos.get(`${lado}-${i}`);
      if (efeito) slot.classList.add(efeito);
      if (lado === 'jogador' && this.sacrificios.has(i)) slot.classList.add('marcada');
      if (this.slotAtivo(lado, i)) slot.classList.add('alvo');
      slot.onclick = () => (aoClicar ? aoClicar(i) : this.inspecionar(carta));
      elemento.appendChild(slot);
    });
  }

  mostrarDetalhe(carta) {
    $('detalhe').innerHTML = carta ? descricaoHTML(carta) : '';
  }

  render() {
    const balanca = $('balanca');
    balanca.innerHTML = '';
    const posicao = Math.max(-LIMITE, Math.min(LIMITE, this.balanca));
    for (let v = -LIMITE; v <= LIMITE; v++) {
      const marca = document.createElement('span');
      marca.className = 'marca' + (v === 0 ? ' meio' : '') + (v === posicao ? ' atual' : '');
      balanca.appendChild(marca);
    }
    $('balanca-texto').textContent = this.balanca === 0 ? 'Equilíbrio'
      : this.balanca > 0 ? `+${this.balanca} a seu favor (vence em +${LIMITE})` : `${this.balanca} contra você (perde em −${LIMITE})`;

    const lei = LEIS[this.lei];
    $('lei').classList.toggle('oculto', !lei);
    if (lei) $('lei').innerHTML = `<span class="lei-icone">${lei.icone}</span><span><b>Lei: ${lei.nome}</b><br>${lei.desc}</span>`;
    $('fase').textContent = this.cfg.chefe ? `Fase ${this.fase} de 2` : '';

    this.desenharLinha('fila', $('linha-fila'));
    this.desenharLinha('inimigo', $('linha-inimigo'), i => this.clicarInimigo(i));
    this.desenharLinha('jogador', $('linha-jogador'), i => this.clicarJogador(i));

    $('n-baralho').textContent = this.baralho.length;
    $('n-almas').textContent = this.almas;
    $('pilha-baralho').classList.toggle('ativa', this.modo === 'comprar' && this.baralho.length > 0);
    $('pilha-almas').classList.toggle('ativa', this.modo === 'comprar' && this.almas > 0);
    $('ossos').textContent = this.ossos;
    $('mp').innerHTML = 'MP ' + Array.from({ length: this.mpMax }, (_, k) => `<i class="${k < this.mp ? 'cheio' : ''}"></i>`).join('');
    $('sino').disabled = this.modo !== 'jogar' || this.sangue > 0;

    const cheio = this.limite >= LIMITE_INFO.max;
    $('limite-barra').innerHTML = Array.from({ length: LIMITE_INFO.max }, (_, k) => `<i class="${k < this.limite ? 'cheio' : ''}"></i>`).join('');
    $('btn-limite').disabled = !cheio || this.modo !== 'jogar' || this.sangue > 0;
    $('btn-limite').classList.toggle('pronto', cheio);

    $('instrucao').textContent = this.instrucao();
    this.mostrarDetalhe(this.selecionada ?? this.inspecionada);
    $('hud-velas').textContent = '🕯️'.repeat(this.jogo.velas) || '—';
    $('hud-dentes').textContent = this.jogo.dentes;

    const mao = $('mao');
    mao.innerHTML = '';
    for (const carta of this.mao) {
      const el = elementoCarta(carta);
      if (carta === this.selecionada) el.classList.add('selecionada');
      else if (this.modo === 'jogar' && this.motivoParaNaoJogar(carta)) el.classList.add('indisponivel');
      el.onclick = () => this.clicarMao(carta);
      el.onmouseenter = () => this.mostrarDetalhe(carta);
      mao.appendChild(el);
    }
  }
}
