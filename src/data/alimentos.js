export const alimentos = [
  {
    id: 1,
    nome: "Arroz branco",
    marca: "Namorado",
    ingredientes: ["Arroz branco"],
    alergenicos: {
      contem: [],
      podeConter: ["soja"],
    },
    restricoes: {
      gluten: "nao_contem",
      lactose: "nao_contem",
      vegetariano: "sim",
      vegano: "sim",
    },
    fonte: {
      tipo: "pagina-desuper-mercado",
      descricao: "Arroz Branco T1 Namorado 1 kg",
      url: "https://pedejadelivery.instabuy.app.br/p/arroz-lf-t1-1-kg-namorado",
    },

    dataConsulta: "25-10-2026"
  },

  {
    id: 2,
    nome: "Feijão Carioca Tipo 1",
    marca: "Kicaldo",
    ingredientes: ["Feijão"],
    alergenicos: {
      contem: [],
      podeConter: ["soja"],
    },
    restricoes: {
      gluten: "nao_contem",
      lactose: "nao_contem",
      vegetariano: "sim",
      vegano: "sim",
    },
    fonte: {
      tipo: "pagina_de_supermercado",
      descricao: "Pão de Açúcar - Feijão Carioca Kicaldo 1 kg",
      url: "https://www.paodeacucar.com/produto/109209/feijao-carioca-tipo-1-kicaldo-pacote-1-kg",
    },

    dataConsulta: "25-10-2026"

  },


  {
    id: 3,
    nome: "Batata Inglesa",
    marca: null,
    ingredientes: ["Batata Inglesa"],
    alergenicos: {
      contem: [],
      podeConter: [],
    },
    restricoes: {
      gluten: "nao_contem",
      lactose: "nao_contem",
      vegetariano: "sim",
      vegano: "sim",
    },

    fonte: {
      tipo: "alimento_in_natura",
      descricao: "Composição natural da batata inglesa",
    },

    dataConsulta: "25-10-2026"
  },


  {
    id: 4,
    nome: "Yoki Milho para Pipoca Premium",
    marca: "Yoki",
    ingredientes: ["Milho de Pipoca"],
    alergenicos: {
      contem: [],
      podeConter: ["soja"],
    },
    
    restricoes: {
      gluten: "nao_contem",
      lactose: "nao_contem",
      vegetariano: "sim",
      vegano: "sim",
    },

    fonte: {
      tipo: "site_oficial_fabricante",
      descricao: "Yoki - Pipoca Premium 500 g",
      url: "https://www.yoki.com.br/produtos/pipoca-premium-500-g",
    },

    dataConsulta: "25-10-2026",

  },


  {
    id: 5,
    nome: "Milho puro",
    marca: null,
    ingredientes: ["Milho"],
    alergenicos: {
      contem: [],
      podeConter: [],
    },
    restricoes: {
      gluten: "nao_contem",
      lactose: "nao_contem",
      vegetariano: "sim",
      vegano: "sim",
    },
    fonte: "Alimento natural - dados gerais",
  },
  {
    id: 6,
    nome: "Banana",
    marca: null,
    ingredientes: ["Banana"],
    alergenicos: {
      contem: [],
      podeConter: [],
    },
    restricoes: {
      gluten: "nao_contem",
      lactose: "nao_contem",
      vegetariano: "sim",
      vegano: "sim",
    },
    fonte: "Alimento natural - dados gerais",
  },
  {
    id: 7,
    nome: "Maçã",
    marca: null,
    ingredientes: ["Maçã"],
    alergenicos: {
      contem: [],
      podeConter: [],
    },
    restricoes: {
      gluten: "nao_contem",
      lactose: "nao_contem",
      vegetariano: "sim",
      vegano: "sim",
    },
    fonte: "Alimento natural - dados gerais",
  },
  {
    id: 8,
    nome: "Ovo",
    marca: null,
    ingredientes: ["Ovo"],
    alergenicos: {
      contem: ["ovo"],
      podeConter: [],
    },
    restricoes: {
      gluten: "nao_contem",
      lactose: "nao_contem",
      vegetariano: "sim",
      vegano: "nao",
    },
    fonte: "Alimento natural - dados gerais",
  },
  {
    id: 9,
    nome: "Leite de vaca",
    marca: null,
    ingredientes: ["Leite"],
    alergenicos: {
      contem: ["leite"],
      podeConter: [],
    },
    restricoes: {
      gluten: "nao_contem",
      lactose: "contem",
      vegetariano: "sim",
      vegano: "nao",
    },
    fonte: "Alimento natural - dados gerais",
  },
  {
    id: 10,
    nome: "Peito de frango",
    marca: null,
    ingredientes: ["Frango"],
    alergenicos: {
      contem: [],
      podeConter: [],
    },
    restricoes: {
      gluten: "nao_contem",
      lactose: "nao_contem",
      vegetariano: "nao",
      vegano: "nao",
    },
    fonte: "Alimento natural - dados gerais",
  },
];