export const receitas = [
  {
    id: 1,
    nome: "Panqueca de Banana",
    descricao:
      "Panqueca prática, macia e naturalmente adocicada, ideal para o café da manhã ou lanche.",
    imagem: "/images/panqueca-banana.jpg",

    ingredientes: [
      "1 banana madura",
      "1 ovo",
      "2 colheres de sopa de aveia sem glúten",
      "Canela a gosto (opcional)",
      "Um fio de óleo para untar a frigideira"
    ],

    modoPreparo: [
      "Amasse a banana com um garfo até formar um purê.",
      "Adicione o ovo e misture bem.",
      "Acrescente a aveia sem glúten e a canela, misturando até obter uma massa homogênea.",
      "Aqueça uma frigideira antiaderente em fogo baixo e unte levemente.",
      "Despeje pequenas porções da massa na frigideira.",
      "Quando a parte de baixo estiver firme e aparecerem pequenas bolhas, vire a panqueca com cuidado.",
      "Deixe dourar do outro lado e retire do fogo.",
      "Sirva em seguida, pura ou com frutas."
    ],

    tempoPreparo: "10 minutos",
    porcoes: 1,

    restricoes: {
      contemGluten: false,
      contemLactose: false,
      vegano: false,
      vegetariano: true
    },

    alergicos: ["Contém ovo."],
    categoria: "Lanches",
    dataCadastro: "2026-10-26"
  },

  {
    id: 2,
    nome: "Coxinha de Frango com Massa de Batata",
    descricao:
      "Coxinha caseira com massa macia feita de batata e recheio de frango desfiado temperado.",
    imagem: "/images/coxinha-frango-batata.jpg",

    ingredientes: [
      "500 g de batata",
      "300 g de peito de frango",
      "1/2 cebola picada",
      "2 dentes de alho picados",
      "2 colheres de sopa de farinha de arroz",
      "1 colher de sopa de azeite",
      "Sal a gosto",
      "Cheiro-verde a gosto",
      "1 ovo para empanar",
      "Farinha de rosca sem glúten para empanar",
      "Óleo para fritar"
    ],

    modoPreparo: [
      "Cozinhe as batatas até ficarem macias. Escorra a água e amasse bem, formando um purê.",
      "Cozinhe o peito de frango, desfie e reserve.",
      "Em uma panela, aqueça o azeite e refogue a cebola e o alho.",
      "Adicione o frango desfiado, o sal e o cheiro-verde. Misture bem e reserve o recheio.",
      "Em uma tigela, misture o purê de batata com a farinha de arroz até obter uma massa que possa ser modelada.",
      "Pegue pequenas porções da massa, abra na mão e coloque um pouco do recheio de frango no centro.",
      "Feche a massa e modele no formato tradicional de coxinha.",
      "Passe as coxinhas no ovo batido e depois na farinha de rosca sem glúten.",
      "Frite em óleo quente até dourarem por igual. Se preferir, asse ou prepare na air fryer até ficarem douradas.",
      "Deixe escorrer o excesso de óleo e sirva."
    ],

    tempoPreparo: "60 minutos",
    porcoes: 10,

    restricoes: {
      contemGluten: false,
      contemLactose: false,
      vegano: false,
      vegetariano: false
    },

    alergicos: ["Contém ovo."],
    categoria: "Salgados",
    dataCadastro: "2026-10-26"
  },

  {
    id: 3,
    nome: "Bolo de Milho de Liquidificador",
    descricao:
      "Bolo caseiro de milho, fofinho e prático, preparado no liquidificador e ideal para o café da manhã ou lanche da tarde.",
    imagem: "/images/bolo-milho-liquidificador.jpg",

    ingredientes: [
      "1 lata de milho-verde escorrido (170 g)",
      "3 ovos",
      "1 xícara de açúcar",
      "1/2 xícara de óleo",
      "1 xícara de leite",
      "1 xícara de fubá",
      "1/2 xícara de farinha de arroz",
      "1 colher de sopa de fermento químico em pó"
    ],

    modoPreparo: [
      "Preaqueça o forno a 180 °C.",
      "Escorra o milho-verde e coloque-o no liquidificador.",
      "Adicione os ovos, o açúcar, o óleo e o leite. Bata até obter uma mistura homogênea.",
      "Acrescente o fubá e a farinha de arroz e bata novamente até incorporar os ingredientes.",
      "Adicione o fermento químico e misture delicadamente com uma colher.",
      "Despeje a massa em uma forma untada com óleo e polvilhada com fubá sem glúten.",
      "Leve ao forno por aproximadamente 35 a 45 minutos, ou até que o bolo esteja dourado e um palito inserido no centro saia limpo.",
      "Espere amornar antes de desenformar e servir."
    ],

    tempoPreparo: "55 minutos",
    porcoes: 10,

    restricoes: {
      contemGluten: false,
      contemLactose: true,
      vegano: false,
      vegetariano: true
    },

    alergicos: [
      "Contém ovo.",
      "Contém leite e derivados."
    ],

    categoria: "Bolos",
    dataCadastro: "2026-10-26"
  },


  {
    id: 4,
    nome: "Pão Caseiro Sem Glúten",
    descricao:
      "Pão caseiro macio por dentro e com casquinha dourada, preparado com farinha de arroz e polvilho doce, ideal para o café da manhã ou lanche.",

    imagem: "/images/pao-caseiro-sem-gluten.jpg",

    ingredientes: [
      "2 xícaras de farinha de arroz (280 g)",
      "1/2 xícara de polvilho doce (60 g)",
      "1 colher de sopa de açúcar",
      "1 colher de sopa de fermento biológico seco",
      "1 colher de chá de sal",
      "2 ovos",
      "2 colheres de sopa de azeite ou óleo",
      "1 colher de chá de vinagre de maçã",
      "1 xícara de água morna (240 ml)",
      "1 colher de sopa de psyllium em pó (opcional)"
    ],

    modoPreparo: [
      "Em uma tigela, misture a farinha de arroz, o polvilho doce, o açúcar, o fermento biológico seco e o sal. Acrescente o psyllium, se desejar.",
      "Adicione os ovos, o azeite ou óleo, o vinagre de maçã e a água morna aos poucos.",
      "Misture bem até formar uma massa grossa e pegajosa. A massa não ficará igual à massa tradicional de pão de trigo.",
      "Transfira a massa para uma forma de pão untada com óleo.",
      "Cubra e deixe descansar por 40 a 60 minutos, até crescer visivelmente.",
      "Preaqueça o forno a 180 °C.",
      "Asse por aproximadamente 35 a 45 minutos, até o pão dourar e ficar firme.",
      "Retire do forno e espere esfriar completamente antes de cortar e servir."
    ],

    tempoPreparo: "1 hora e 30 minutos",
    porcoes: 10,

    restricoes: {
      contemGluten: false,
      contemLactose: false,
      vegano: false,
      vegetariano: true
    },

    alergicos: [
      "Contém ovo."
    ],

    categoria: "Pães",
    dataCadastro: "2026-10-26"
  },


  {
    id: 5,
    nome: "Bolo de Cenoura com Cobertura de Chocolate Sem Lactose",
    descricao:
      "Bolo de cenoura fofinho com cobertura de chocolate cremosa, preparado sem leite e derivados lácteos, ideal para o café da manhã ou lanche da tarde.",

    imagem: "/images/bolo-cenoura-sem-lactose.jpg",

    ingredientes: [
      "3 cenouras médias picadas",
      "3 ovos",
      "1 xícara de óleo (240 ml)",
      "2 xícaras de açúcar",
      "2 xícaras de farinha de trigo",
      "1 colher de sopa de fermento químico em pó",
      "1 xícara de açúcar para a cobertura",
      "3 colheres de sopa de cacau em pó 100%",
      "3 colheres de sopa de óleo para a cobertura",
      "5 colheres de sopa de água"
    ],

    modoPreparo: [
      "Preaqueça o forno a 180 °C e unte uma forma com óleo e farinha de trigo.",
      "No liquidificador, bata as cenouras picadas, os ovos, o óleo e o açúcar até obter uma mistura homogênea.",
      "Transfira a mistura para uma tigela e acrescente a farinha de trigo aos poucos, mexendo até incorporar.",
      "Adicione o fermento químico e misture delicadamente.",
      "Despeje a massa na forma e leve ao forno por aproximadamente 35 a 40 minutos. Faça o teste do palito para verificar se está assado.",
      "Para preparar a cobertura, misture o açúcar, o cacau em pó, o óleo e a água em uma panela.",
      "Leve ao fogo baixo, mexendo continuamente até a cobertura engrossar levemente.",
      "Desenforme o bolo depois de amornar e espalhe a cobertura por cima.",
      "Espere esfriar um pouco antes de cortar e servir."
    ],

    tempoPreparo: "50 minutos",
    porcoes: 10,

    restricoes: {
      contemGluten: true,
      contemLactose: false,
      vegano: false,
      vegetariano: true
    },

    alergicos: [
      "Contém ovo.",
      "Contém trigo (glúten)."
    ],

    categoria: "Bolos",
    dataCadastro: "2026-10-26"
  },

  
  {
    id: 6,
    nome: "Brigadeiro Sem Lactose",
    descricao:
      "Brigadeiro cremoso preparado com leite condensado vegetal e cacau em pó, ideal para quem busca uma sobremesa sem lactose.",

    imagem: "/images/brigadeiro-sem-lactose.jpg",

    ingredientes: [
      "1 caixa de leite condensado vegetal (395 g)",
      "2 colheres de sopa de cacau em pó 100%",
      "1 colher de sopa de óleo de coco",
      "Chocolate granulado sem leite para decorar (opcional)"
    ],

    modoPreparo: [
      "Em uma panela, coloque o leite condensado vegetal, o cacau em pó e o óleo de coco.",
      "Misture bem os ingredientes antes de levar ao fogo, para dissolver o cacau.",
      "Leve ao fogo baixo, mexendo continuamente para não grudar no fundo da panela.",
      "Continue mexendo por aproximadamente 10 a 15 minutos, até a mistura engrossar e começar a desgrudar do fundo da panela.",
      "Transfira a mistura para um prato untado e deixe esfriar completamente.",
      "Unte as mãos com um pouco de óleo de coco e modele pequenas bolinhas.",
      "Passe os brigadeiros no chocolate granulado sem leite, se desejar, e coloque em forminhas."
    ],

    tempoPreparo: "25 minutos",
    porcoes: 15,

    restricoes: {
      contemGluten: false,
      contemLactose: false,
      vegano: true,
      vegetariano: true
    },

    alergicos: [],

    categoria: "Doces",
    dataCadastro: "2026-10-26"
  },


];