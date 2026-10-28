export function filtrarAlimentos(alimentos, busca, filtros) {
  const texto = busca.trim().toLowerCase();

  return alimentos.filter((alimento) => {
    // Busca pelo nome, marca ou ingredientes
    const nome = (alimento.nome ?? "").toLowerCase();
    const marca = (alimento.marca ?? "").toLowerCase();

    const ingredientes = (alimento.ingredientes ?? [])
      .join(" ")
      .toLowerCase();

    const correspondeBusca =
      nome.includes(texto) ||
      marca.includes(texto) ||
      ingredientes.includes(texto);

    // Filtros de restrições
    const restricoes = alimento.restricoes ?? {};

    const correspondeGluten =
      !filtros.semGluten ||
      restricoes.gluten === "nao_contem";

    const correspondeLactose =
      !filtros.semLactose ||
      restricoes.lactose === "nao_contem";

    const correspondeVegetariano =
      !filtros.vegetariano ||
      restricoes.vegetariano === "sim";

    const correspondeVegano =
      !filtros.vegano ||
      restricoes.vegano === "sim";

    return (
      correspondeBusca &&
      correspondeGluten &&
      correspondeLactose &&
      correspondeVegetariano &&
      correspondeVegano
    );
  });
}