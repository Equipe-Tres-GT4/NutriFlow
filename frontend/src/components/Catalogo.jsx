import { useState } from "react";
import { alimentos } from "../data/alimentos";
import { filtrarAlimentos } from "../data/filtrarAlimentos";

function Catalogo() {
  const [busca, setBusca] = useState("");

  const [filtros, setFiltros] = useState({
    semGluten: false,
    semLactose: false,
    vegetariano: false,
    vegano: false,
  });

  function atualizarFiltro(event) {
    const { name, checked } = event.target;

    setFiltros((filtrosAtuais) => ({
      ...filtrosAtuais,
      [name]: checked,
    }));
  }

  function mostrarRestricao(valor, tipo) {
    if (tipo === "sim") {
      if (valor === "sim") return "Sim";
      if (valor === "nao") return "Não";
      return "Não verificado";
    }

    if (valor === "nao_contem") {
      return "Não contém, conforme os dados cadastrados";
    }

    if (valor === "contem") {
      return "Contém";
    }

    return "Não verificado";
  }

  const alimentosFiltrados = filtrarAlimentos(
    alimentos,
    busca,
    filtros
  );

  return (
    <main className="container py-4 py-md-5">
      <div className="mb-4">
        <h1 className="fw-bold mb-2">Catálogo de alimentos</h1>
        <p className="text-secondary mb-0">
          Encontre alimentos e consulte informações sobre restrições alimentares.
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="buscaAlimentos" className="form-label fw-semibold">
          Buscar alimentos
        </label>

        <div className="input-group input-group-lg shadow-sm">
          <span className="input-group-text bg-white">
            <i className="bi bi-search" aria-hidden="true"></i>
          </span>

          <input
            id="buscaAlimentos"
            type="search"
            className="form-control"
            placeholder="Nome, marca ou ingrediente..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>
      </div>

      <section className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-sliders fs-5" aria-hidden="true"></i>
            <h2 className="h5 fw-bold mb-0">Filtros</h2>
          </div>

          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="semGluten"
                  name="semGluten"
                  checked={filtros.semGluten}
                  onChange={atualizarFiltro}
                />
                <label className="form-check-label" htmlFor="semGluten">
                  Sem glúten
                </label>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="semLactose"
                  name="semLactose"
                  checked={filtros.semLactose}
                  onChange={atualizarFiltro}
                />
                <label className="form-check-label" htmlFor="semLactose">
                  Sem lactose
                </label>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="vegetariano"
                  name="vegetariano"
                  checked={filtros.vegetariano}
                  onChange={atualizarFiltro}
                />
                <label className="form-check-label" htmlFor="vegetariano">
                  Vegetariano
                </label>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="vegano"
                  name="vegano"
                  checked={filtros.vegano}
                  onChange={atualizarFiltro}
                />
                <label className="form-check-label" htmlFor="vegano">
                  Vegano
                </label>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setBusca("");
                setFiltros({
                  semGluten: false,
                  semLactose: false,
                  vegetariano: false,
                  vegano: false,
                });
              }}
            >
              <i className="bi bi-x-circle me-1" aria-hidden="true"></i>
              Limpar filtros
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 fw-bold mb-0">Alimentos</h2>

          <span className="badge text-bg-light border rounded-pill px-3 py-2">
            {alimentosFiltrados.length} resultado(s)
          </span>
        </div>

        {alimentosFiltrados.length > 0 ? (
          <div className="row g-4">
            {alimentosFiltrados.map((alimento) => {
              const restricoes = alimento.restricoes ?? {};

              return (
                <div
                  className="col-12 col-sm-6 col-lg-4"
                  key={alimento.id}
                >
                  <article className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
                    {alimento.imagem && (
                      <div className="bg-light d-flex align-items-center justify-content-center p-3">
                        <img
                          src={alimento.imagem}
                          alt={alimento.nome}
                          className="img-fluid"
                          style={{
                            height: "180px",
                            width: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    )}

                    <div className="card-body p-3 p-md-4">
                      <h3 className="h5 fw-bold mb-2">
                        {alimento.nome}
                      </h3>

                      {alimento.marca && (
                        <p className="text-secondary small mb-3">
                          <i className="bi bi-tag me-1" aria-hidden="true"></i>
                          Marca: {alimento.marca}
                        </p>
                      )}

                      <hr className="text-secondary opacity-25" />

                      <div className="small">
                        <p className="mb-2">
                          <strong>Glúten:</strong>{" "}
                          {mostrarRestricao(restricoes.gluten, "restricao")}
                        </p>

                        <p className="mb-2">
                          <strong>Lactose:</strong>{" "}
                          {mostrarRestricao(restricoes.lactose, "restricao")}
                        </p>

                        <p className="mb-2">
                          <strong>Vegetariano:</strong>{" "}
                          {mostrarRestricao(restricoes.vegetariano, "sim")}
                        </p>

                        <p className="mb-0">
                          <strong>Vegano:</strong>{" "}
                          {mostrarRestricao(restricoes.vegano, "sim")}
                        </p>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center bg-light rounded-3 p-5">
            <i
              className="bi bi-search fs-1 text-secondary"
              aria-hidden="true"
            ></i>

            <h3 className="h5 fw-bold mt-3">
              Nenhum alimento encontrado
            </h3>

            <p className="text-secondary mb-3">
              Tente alterar a busca ou desmarcar algum filtro.
            </p>

            <button
              type="button"
              className="btn btn-outline-success"
              onClick={() => {
                setBusca("");
                setFiltros({
                  semGluten: false,
                  semLactose: false,
                  vegetariano: false,
                  vegano: false,
                });
              }}
            >
              Limpar busca e filtros
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Catalogo;