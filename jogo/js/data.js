// Sigilos: habilidades especiais impressas nas cartas.
export const SIGILOS = {
  salto: { nome: 'Salto', icone: '⇡', desc: 'Salta sobre a criatura à frente e ataca a balança diretamente.' },
  espinhos: { nome: 'Espinhos', icone: '✶', desc: 'Quem atacar esta carta sofre 1 de dano.' },
  veneno: { nome: 'Toque Mortal', icone: '☠', desc: 'Mata qualquer criatura que ferir.' },
  feitico: { nome: 'Fogo', icone: '♨', desc: 'Ao entrar, causa 2 de dano à criatura à frente.' },
  cura: { nome: 'Cura', icone: '✚', desc: 'No início do seu turno, cura 1 dos aliados vizinhos.' },
  digno: { nome: 'Sangue Digno', icone: '♥', desc: 'Vale 3 sacrifícios.' },
  renasce: { nome: 'Morto-Vivo', icone: '↺', desc: 'Na primeira vez que morre, volta.' },
  corte: { nome: 'Corte Final', icone: '⚔', desc: 'Ao entrar, destrói a criatura à frente.' },
  dreno: { nome: 'Dreno', icone: '✧', desc: 'Ao causar dano, recupera 1 MP.' },
  nevasca: { nome: 'Nevasca', icone: '❄', desc: 'Ao entrar, causa 1 de dano a todos os inimigos.' },
};

// custo: sangue (sacrifícios), ossos (de criaturas mortas) ou mp (magia, recarrega a cada turno).
export const CARTAS = {
  // Lado do jogador
  alma: { nome: 'Alma Perdida', arte: '👻', atk: 0, hp: 1, custo: {} },
  cavaleiro: { nome: 'Cavaleiro Sombrio', arte: '🛡️', atk: 2, hp: 2, custo: { sangue: 1 } },
  lanceiro: { nome: 'Lanceiro', arte: '🔱', atk: 2, hp: 2, custo: { sangue: 2 }, sigilos: ['salto'] },
  paladino: { nome: 'Paladino', arte: '⚜️', atk: 1, hp: 4, custo: { sangue: 1 }, sigilos: ['espinhos'] },
  magoNegro: { nome: 'Mago Negro', arte: '🧙', atk: 1, hp: 1, custo: { mp: 2 }, sigilos: ['feitico'] },
  magoBranco: { nome: 'Mago Branco', arte: '🕊️', atk: 0, hp: 3, custo: { mp: 2 }, sigilos: ['cura'] },
  ladrao: { nome: 'Ladrão', arte: '🗡️', atk: 1, hp: 2, custo: { ossos: 2 }, sigilos: ['dreno'] },
  monge: { nome: 'Monge', arte: '👊', atk: 3, hp: 1, custo: { ossos: 4 } },
  ninja: { nome: 'Ninja', arte: '🥷', atk: 2, hp: 1, custo: { ossos: 3 }, sigilos: ['veneno'] },
  cordeiro: { nome: 'Cordeiro Ritual', arte: '🐑', atk: 0, hp: 1, custo: { ossos: 3 }, sigilos: ['digno'] },
  necromante: { nome: 'Necromante', arte: '🕯️', atk: 1, hp: 2, custo: { ossos: 2 }, sigilos: ['renasce'] },

  // Invocações (raras)
  ifrit: { nome: 'Ifrit', arte: '🔥', atk: 4, hp: 3, custo: { sangue: 3 }, sigilos: ['feitico'], raro: true },
  shiva: { nome: 'Shiva', arte: '❄️', atk: 2, hp: 3, custo: { mp: 5 }, sigilos: ['nevasca'], raro: true },
  odin: { nome: 'Odin', arte: '🐎', atk: 3, hp: 3, custo: { sangue: 3 }, sigilos: ['corte'], raro: true },
  bahamut: { nome: 'Bahamut', arte: '🐉', atk: 5, hp: 5, custo: { sangue: 4 }, sigilos: ['salto'], raro: true },

  // Magias
  fogo: { nome: 'Fogo', arte: '🔥', tipo: 'magia', custo: { mp: 2 }, alvo: 'inimigo', dano: 2, desc: '2 de dano a um inimigo.' },
  gelo: { nome: 'Gelo', arte: '🧊', tipo: 'magia', custo: { mp: 3 }, alvo: 'todos', dano: 1, desc: '1 de dano a todos os inimigos.' },
  raio: { nome: 'Raio', arte: '⚡', tipo: 'magia', custo: { mp: 4 }, alvo: 'inimigo', dano: 4, desc: '4 de dano a um inimigo.' },
  curaM: { nome: 'Cura', arte: '💧', tipo: 'magia', custo: { mp: 1 }, alvo: 'aliado', cura: 3, desc: 'Cura 3 de um aliado.' },
  fenix: { nome: 'Pena de Fênix', arte: '🪶', tipo: 'magia', custo: { mp: 3 }, alvo: 'nenhum', reviver: true, desc: 'A última criatura morta volta para a mão.' },

  // Criaturas do Guardião
  carnical: { nome: 'Carniçal', arte: '🧟', atk: 1, hp: 2, custo: {} },
  esqueleto: { nome: 'Esqueleto', arte: '💀', atk: 1, hp: 1, custo: {}, sigilos: ['renasce'] },
  verme: { nome: 'Verme', arte: '🪱', atk: 1, hp: 3, custo: {} },
  olho: { nome: 'Olho Vigilante', arte: '👁️', atk: 2, hp: 2, custo: {} },
  lobo: { nome: 'Lobo Faminto', arte: '🐺', atk: 3, hp: 1, custo: {} },
  aranha: { nome: 'Aranha', arte: '🕷️', atk: 1, hp: 1, custo: {}, sigilos: ['veneno'] },
  morcego: { nome: 'Morcego', arte: '🦇', atk: 1, hp: 1, custo: {}, sigilos: ['salto'] },
  golem: { nome: 'Golem de Cristal', arte: '🗿', atk: 1, hp: 4, custo: {}, sigilos: ['espinhos'] },
  sombra: { nome: 'Sombra', arte: '🌑', atk: 2, hp: 3, custo: {}, sigilos: ['dreno'] },

  // Os quatro demônios dos cristais
  lich: { nome: 'Lich', arte: '☠️', atk: 2, hp: 5, custo: {}, sigilos: ['renasce'], chefe: true },
  marilith: { nome: 'Marilith', arte: '🐍', atk: 3, hp: 6, custo: {}, sigilos: ['espinhos'], chefe: true },
  kraken: { nome: 'Kraken', arte: '🦑', atk: 3, hp: 9, custo: {}, chefe: true },
  tiamat: { nome: 'Tiamat', arte: '🐲', atk: 4, hp: 7, custo: {}, sigilos: ['salto'], chefe: true },

  // Surpresas
  mimico: { nome: 'Mímico', arte: '📦', atk: 2, hp: 5, custo: {}, sigilos: ['espinhos'], chefe: true },
};

// Leis da mesa: o Guardião muda as regras de algumas batalhas.
export const LEIS = {
  lua: { nome: 'Lua de Sangue', icone: '🌕', desc: 'Cada sacrifício dá 2 ossos em vez de 1.' },
  nevoa: { nome: 'Névoa', icone: '🌫️', desc: 'Você não vê as cartas que o Guardião vai jogar.' },
  eclipse: { nome: 'Eclipse', icone: '🌑', desc: 'Seu MP começa em 3, mas não cresce.' },
  mare: { nome: 'Maré', icone: '🌊', desc: 'Depois de cada sino, todas as cartas deslizam uma pista para a direita.' },
  espelho: { nome: 'Espelho', icone: '🪞', desc: 'O primeiro inimigo que morrer vai para a sua mão, de graça.' },
  viciada: { nome: 'Balança Viciada', icone: '⚖️', desc: 'A balança começa em −2, mas vencer dá +3 dentes.' },
  velaCurta: { nome: 'Vela Curta', icone: '🕯️', desc: 'A partir do turno 8, a balança pende 1 contra você a cada turno.' },
  caos: { nome: 'Caos', icone: '🎲', desc: 'No início de cada turno, uma carta da sua mão vira outra carta aleatória.' },
};

export const LIMITE = {
  max: 5,
  nome: 'Juízo Final',
  desc: 'Enche quando suas criaturas sofrem dano ou são sacrificadas. Cheia: todas as suas criaturas atacam agora com +1 de ataque, sem passar o turno.',
};

export const DECK_INICIAL = ['cavaleiro', 'cavaleiro', 'lanceiro', 'paladino', 'magoNegro', 'magoBranco', 'ladrao', 'cordeiro', 'fogo', 'curaM'];

export const RECOMPENSAS = {
  comum: ['cavaleiro', 'lanceiro', 'paladino', 'magoNegro', 'magoBranco', 'ladrao', 'monge', 'ninja', 'cordeiro', 'necromante'],
  magia: ['fogo', 'gelo', 'raio', 'curaM', 'fenix'],
  raro: ['ifrit', 'shiva', 'odin', 'bahamut'],
};

export const REGIOES = [
  { cristal: 'Terra', cor: '#8a7440', chefe: 'lich', lei: 'nevoa', pool: ['carnical', 'esqueleto', 'verme', 'olho'] },
  { cristal: 'Fogo', cor: '#b0402c', chefe: 'marilith', lei: 'velaCurta', pool: ['lobo', 'aranha', 'carnical', 'olho', 'esqueleto'] },
  { cristal: 'Água', cor: '#2f6f9f', chefe: 'kraken', lei: 'mare', pool: ['verme', 'golem', 'aranha', 'sombra', 'lobo'] },
  { cristal: 'Vento', cor: '#7fa0a0', chefe: 'tiamat', lei: 'eclipse', pool: ['morcego', 'sombra', 'golem', 'lobo', 'aranha'] },
];

export const FALAS = {
  inicio: [
    'Ah... você acordou.',
    'Ninguém sai desta cabana sem jogar.',
    'Quatro cristais apodrecem na escuridão. Purifique-os... ou vire uma carta no meu baralho.',
  ],
  batalha: [
    'Sente o cheiro de cera queimada? É o seu tempo.',
    'Minhas criaturas estão famintas.',
    'Escolha bem seus sacrifícios.',
    'Você ouviu isso? ...Não foi nada.',
  ],
  vitoria: ['Hmm. Sorte.', 'A balança pende a seu favor... por enquanto.', 'Interessante.'],
  vela: ['Uma vela se apaga. Restam poucas luzes para você.', 'Está ficando escuro, não está?'],
  morte: ['A última chama se apagou.', 'Sorria. Vou guardar seu retrato com carinho.'],
  alma: 'Reconhece este rosto? Ele também achou que ia escapar.',
  fogueira: 'O fogo fortalece... mas algo na escuridão também está com fome.',
  devorada: 'Ouviu os ossos estalando? Sua carta não volta mais.',
  altar: 'Um sangue pelo outro. É assim que funciona aqui.',
  mercador: 'O mercador não tem olhos. Mas ele vê os seus dentes.',
  cristal: 'Um cristal puro. A luz dele devolve uma vela.',
  chefe: nome => `O demônio ${nome} guarda o cristal. Ele não morre fácil.`,
  fase2: 'Não acabou. Ele se levanta outra vez.',
  purificado: c => `O Cristal da ${c} brilha de novo. Eu... não esperava isso.`,
  lei: l => `Nova lei sobre a mesa: ${l.nome}. ${l.desc}`,
  limite: 'JUÍZO FINAL!',
  roubo: c => `Que ${c} bonito. Acho que vou ficar com ele... nesta mesa, agora ele é meu.`,
  apagao: 'Desculpe. Foi o vento.',
  apagaoDepois: c => `Enquanto estava escuro, ${c} ficou mais forte. Não me olhe assim.`,
  acordo: 'Vou te propor um acordo. Apague uma vela e eu deixo você vencer esta mesa agora.',
  acordoAceito: 'Fechado. Eu sempre cumpro minha palavra. Quase sempre.',
  acordoRecusado: 'Orgulho. Eu gosto disso.',
  caos: 'Uma carta na sua mão se contorce e muda de forma.',
  mare: 'A maré sobe. Tudo desliza para a direita.',
  espelho: c => `${c} olha para você do outro lado do espelho... e muda de lado.`,
  velaCurta: 'A cera escorre. A balança pende contra você.',
  voltou: n => `Achou que eu não ia perceber que você saiu, ${n}?`,
  bau: 'Um baú no meio da escuridão. Você ouve... uma respiração?',
  mimico: 'Não é um baú.',
  bauAberto: 'Só um baú. Desta vez.',
  dados: 'Vamos jogar dados. O maior número vence. Empate é meu.',
  semDentes: 'Sem dentes? Então aposte uma carta.',
  espelhoNo: 'O espelho rachado copia tudo. Mas o reflexo é sempre um pouco mais fraco.',
  bemVindo: n => `Bem-vindo de volta, ${n}. Eu guardei seu retrato.`,
  dicas: {
    inicio: 'Esta é a minha mesa. Embaixo ficam as suas pistas. No meio, as minhas criaturas. Em cima, o que vou jogar a seguir.',
    comprar: 'Todo turno você compra uma carta: do seu baralho ou uma Alma Perdida.',
    sangue: 'Essa carta pede sangue. Clique nas suas criaturas na mesa para sacrificá-las.',
    sino: 'Quando terminar, toque o sino. Cada criatura sua ataca a pista da frente.',
    balanca: 'O dano que passa direto vai para a balança. Cinco a seu favor e você vence.',
    limite: 'Sua barra de Limite está cheia. Use o Juízo Final quando quiser.',
    detalhe: 'Passe o mouse ou toque numa carta da mesa para ler o que ela faz.',
  },
  final: 'Os quatro cristais brilham. A porta da cabana range... Vá. Antes que eu mude de ideia.',
};
