
import { useState } from "react";
import { alimentos } from "../data/alimentos";
import "./Catalogo.css";
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
    <main className="catalogo">
      <h1>Catálogo de alimentos</h1>

      <input
        type="search"
        className="campo-busca"
        placeholder="Busque por alimento, marca ou ingrediente..."
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
      />

      <section className="filtros">
        <h2>Filtros</h2>

        <label>
          <input
            type="checkbox"
            name="semGluten"
            checked={filtros.semGluten}
            onChange={atualizarFiltro}
          />
          Sem glúten
        </label>

        <label>
          <input
            type="checkbox"
            name="semLactose"
            checked={filtros.semLactose}
            onChange={atualizarFiltro}
          />
          Sem lactose
        </label>

        <label>
          <input
            type="checkbox"
            name="vegetariano"
            checked={filtros.vegetariano}
            onChange={atualizarFiltro}
          />
          Vegetariano
        </label>

        <label>
          <input
            type="checkbox"
            name="vegano"
            checked={filtros.vegano}
            onChange={atualizarFiltro}
          />
          Vegano
        </label>
      </section>

      <section className="resultados">
        <h2>Resultados ({alimentosFiltrados.length})</h2>

        {alimentosFiltrados.length > 0 ? (
          <div className="lista-alimentos">
            {alimentosFiltrados.map((alimento) => {
              const restricoes = alimento.restricoes ?? {};

              return (
                <article
                  className="card-alimento"
                  key={alimento.id}
                >
                  {alimento.imagem && (
                    <img
                      className="imagem-alimento"
                      src={alimento.imagem}
                      alt={alimento.nome}
                    />
                  )}

                  <div className="informacoes-alimento">
                    <h3>{alimento.nome}</h3>

                    {alimento.marca && (
                      <p>
                        <strong>Marca:</strong> {alimento.marca}
                      </p>
                    )}

                    <p>
                      <strong>Glúten:</strong>{" "}
                      {mostrarRestricao(restricoes.gluten, "restricao")}
                    </p>

                    <p>
                      <strong>Lactose:</strong>{" "}
                      {mostrarRestricao(restricoes.lactose, "restricao")}
                    </p>

                    <p>
                      <strong>Vegetariano:</strong>{" "}
                      {mostrarRestricao(
                        restricoes.vegetariano,
                        "sim"
                      )}
                    </p>

                    <p>
                      <strong>Vegano:</strong>{" "}
                      {mostrarRestricao(restricoes.vegano, "sim")}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p>Nenhum alimento encontrado.</p>
        )}
      </section>
    </main>
  );
}

export default Catalogo;
