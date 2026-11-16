// ALIMENTOS INICIAIS DO NUTRIFLOW
export const alimentos = [
  {
    id: 1,
    nome: "Arroz branco",
    marca: "Namorado",
    categoria: "Grãos",         // <- Adicionado para o filtro por categoria funcionar
    porcao: "100g",              // <- Adicionado para exibir na tela
    calorias: "130 kcal",        // <- Adicionado para exibir na tela
    carboidratos: "28g",         // <- Adicionado para exibir na tela
    proteinas: "2.7g",           // <- Adicionado para exibir na tela
    fibras: "0.4g",
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
      tipo: "pagina-de-supermercado",
      descricao: "Arroz Branco T1 Namorado 1 kg",
      url: "https://pedejadelivery.instabuy.app.br/p/arroz-lf-t1-1-kg-namorado",
    },
    dataConsulta: "2026-10-25"
  },

  {
    id: 2,
    nome: "Feijão Carioca Tipo 1",
    marca: "Kicaldo",
    categoria: "Grãos",
    porcao: "100g",
    calorias: "76 kcal",
    carboidratos: "14g",
    proteinas: "4.8g",
    fibras: "6.0g",
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
    dataConsulta: "2026-10-25"
  },

  {
    id: 3,
    nome: "Batata Inglesa",
    marca: null,
    categoria: "Legumes",
    porcao: "100g",
    calorias: "86 kcal",
    carboidratos: "20g",
    proteinas: "1.7g",
    fibras: "1.8g",
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
      url: "https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf"
    },
    dataConsulta: "2026-10-25"
  },

  {
    id: 4,
    nome: "Yoki Milho para Pipoca Premium",
    marca: "Yoki",
    categoria: "Grãos",
    porcao: "50g",
    calorias: "175 kcal",
    carboidratos: "36g",
    proteinas: "4.5g",
    fibras: "7.0g",
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
    dataConsulta: "2026-10-25",
  },

  {
    id: 5,
    nome: "Achocolatado em Pó NESCAU 2.0",
    marca: "Nestlé",
    categoria: "Laticínios",
    porcao: "20g",
    calorias: "75 kcal",
    carboidratos: "16g",
    proteinas: "0.8g",
    fibras: "0.5g",
    imagem: "/nescaunestle.jpg",
    ingredientes: [
      "Açúcar", "Cacau em pó", "Maltodextrina", "Minerais", 
      "Vitaminas", "Soro de leite em pó", "Emulsificante lecitina", "Aromatizante"
    ],
    alergenicos: {
      contem: ["Leite", "Soja", "Glutén"],
      podeConter: ["Trigo", "Aveia", "Cevada"],
    },
    restricoes: {
      gluten: "contem",
      lactose: "contem",
      vegetariano: "nao_confirmado",
      vegano: "nao",
    },
    fonte: {
      tipo: "produto_industrializado",
      descricao: "Achocolatado em pó com sabor chocolate",
      url: "https://www.paodeacucar.com/produto/586542/achocolatado-em-po-nescau-550g"
    },
    dataConsulta: "2026-10-25"
  },

  {
    id: 6,
    nome: "Leite Integral UHT",
    marca: "Italac",
    categoria: "Laticínios",
    porcao: "200ml",
    calorias: "116 kcal",
    carboidratos: "10g",
    proteinas: "6.0g",
    fibras: "0g",
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
    dataConsulta: "2026-10-25"
  },
];