export const alimentos = [
  {
    id: 1,
    nome: "Arroz branco",
    marca: "Namorado",
    imagem: "/arrozbranco.png",
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
    imagem: "/feijaokicaldo.jpg",
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
    imagem: "/batatainglesa.jpg",
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
    imagem: "/yokimilho.jpg",
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
    nome: "Achocolatado em Pó NESCAU 2.0",
    marca: "Nestlé",
    imagem: "/nescaunestle.jpg",
    ingredientes: [
      "Açúcar",
      "Cacau em pó",
      "Maltodextrina",
      "Minerais",
      "Vitaminas",
      "Soro de leite em pó",
      "Emulsificante lecitina",
      "Aromatizante"
    ],

    alergenicos: {
      contem: ["Leite", "Soja", "Glutén"],
      podeConter: ["Trigo", "Aveia", "Cevada"],
    },

    restricoes: {
      gluten: "contem",
      lactose: "contem",
      vegetariano: "desconhecido",
      vegano: "nao",
    },
    fonte: {
      tipo: "produto_industrializado",
      descricao: "Achocolatado em pó com sabor chocolate",
      url: "https://www.paodeacucar.com/produto/586542/achocolatado-em-po-nescau-550g"
    }
  },

  {
    id: 6,
    nome: "Leite Integral UHT",
    marca: "Italac",
    imagem: "/leiteintegral.jpg",
    ingredientes: ["Leite Integral"],
    alergenicos: {
      contem: ["Leite"],
      podeConter: [],
    },
    restricoes: {
      gluten: "nao_contem",
      lactose: "contem",
      vegetariano: "sim",
      vegano: "nao",
    },
    fonte: {
      tipo: "produto_industrializado",
      descricao: "Leite Integral UHT Italac",
      url: "https://www.italac.com.br/"
    },

    dataConsulta: "25-10-2026"
  },
];