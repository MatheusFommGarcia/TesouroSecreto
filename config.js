/* =========================================================================
   CONFIG.js — Personalize aqui toda a aventura
   -------------------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar para transformar o site
   em algo feito especialmente para ela. Troque os valores entre aspas.
   Não precisa mexer em index.html, style.css ou script.js.
   ========================================================================= */

const CONFIG = {

  /* ---------- IDENTIDADE ---------- */

  // Nome dela. Enquanto ficar como 'NOME_DA_PESSOA', a carta final não
  // mostra nenhum nome (fica só "Querida,").
  nome: "Maria",

  // Apelido carinhoso (uso livre, caso você queira usar em algum texto seu).
  apelido: "APELIDO",

  // Seu nome (quem preparou a aventura).
  nomeDoCapitao: "SEU_NOME",

  /* ---------- RESPOSTAS DOS ENIGMAS ---------- */

  // Enquanto estiver como 'lugar_do_primeiro_encontro', qualquer resposta
  // é aceita na Ilha Secreta. Preencha para exigir a resposta certa
  // (a comparação ignora maiúsculas/minúsculas e aceita como parte do texto).
  primeiroEncontro: "lugar_do_primeiro_encontro",

  // Mesma lógica acima, usada no Arquipélago dos Sonhos.
  comidaFavorita: "comida_favorita",

  // Ano de nascimento dela, usado no cadeado de 4 dígitos da Ilha dos Enigmas.
  anoNascimento: "2008",

  /* ---------- SENHA FINAL ---------- */

  // Palavra que vai sendo revelada letra a letra no Diário conforme ela
  // avança na aventura. Pode ser "AMOR", um apelido, um lugar especial etc.
  palavraSecreta: "AMOR",

  /* ---------- MEMÓRIAS (Ilha das Memórias — jogo da memória) ---------- */
  // Uma frase para cada par encontrado. Pode deixar 6 (padrão) ou mais.
  memorias: [
    "Foi aqui que tudo começou.",
    "Esse momento ficou guardado comigo.",
    "Lembro exatamente do que você estava vestindo naquele dia.",
    "Essa foi a primeira vez que eu pensei: quero mais disso.",
    "Guardei essa lembrança como quem guarda um tesouro.",
    "Até hoje, só de lembrar disso, um sorriso aparece do nada."
  ],

  /* ---------- CARTAS DESBLOQUEÁVEIS (aparecem no Diário) ---------- */
  cartas: [
    {
      titulo: "Carta 01 — O começo",
      texto: "Talvez você não saiba, mas aquele primeiro momento ficou guardado comigo."
    },
    {
      titulo: "Carta 02 — Memórias",
      texto: "Se eu pudesse reviver um dia nosso, seria exatamente esse."
    },
    {
      titulo: "Carta 03 — Distância",
      texto: "Mesmo quando não estamos perto, você continua presente em tudo o que eu penso."
    },
    {
      titulo: "Carta 04 — Futuro",
      texto: "Ainda existem muitas ilhas que eu quero conhecer ao seu lado."
    }
  ],

  /* ---------- MENSAGEM DA GARRAFA (easter egg que flutua na tela) ---------- */
  mensagemGarrafa: "Se você está lendo isso, é porque o mar quis que a gente se encontrasse de novo. Só isso já é motivo suficiente para eu sorrir hoje.",

  /* ---------- FOTOS (opcional) ---------- */
  // Coloque os arquivos em /assets/foto01.jpg, foto02.jpg, foto03.jpg.
  // Se o arquivo não existir, a foto simplesmente não aparece — o site
  // continua funcionando normalmente.
  fotos: [
    { src: "assets/foto01.jpg", legenda: "Um momento nosso" },
    { src: "assets/foto02.jpg", legenda: "Outro momento nosso" },
    { src: "assets/foto03.jpg", legenda: "Mais um momento nosso" }
  ],

  /* ---------- CARTA FINAL (dentro do baú do tesouro) ---------- */
  // Cada string vira um parágrafo. Edite à vontade — pode ficar do jeitinho
  // que você quiser dizer para ela.
  mensagemFinal: [
    "Se você chegou até aqui, significa que conseguiu completar a jornada.",
    "Mas existe uma última coisa que eu preciso revelar.",
    "O tesouro nunca esteve escondido nesta ilha.",
    "Ele esteve em seu sorriso.",
    "Em cada conversa.",
    "Em cada momento.",
    "Em cada beijo.",
    "Em cada lembrança.",
    "E, principalmente..."
  ],

  // Frase de destaque, exibida em maior evidência logo depois da mensagem final.
  mensagemFinalDestaque: "Em você. Você é o meu maior tesouro, e ainda teremos muitas aventuras juntosv. ❤️",

  /* ---------- PISTA FÍSICA / SURPRESA REAL (opcional) ---------- */
  // Se preenchido, um botão "Existe uma última pista ⚓" aparece na tela final.
  // Deixe em branco ("") para não mostrar nada.
  finalPhysicalClue: "",

  // Link opcional (QR Code, playlist, vídeo, localização etc.) mostrado
  // junto com a pista física, se houver.
  qrCodeUrl: ""

};