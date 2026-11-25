document.addEventListener("DOMContentLoaded", () => {
  const campoBusca = document.getElementById("buscarAlertas");
  const filtroNivel = document.getElementById("filtronivel");
  const contadorCriticos = document.getElementById("alertasCriticos");
  const contadorTotal = document.getElementById("totalAlertas");
  const estado = document.getElementById("estadoAlertas");
  const lista = document.getElementById("listaAlertasDados");
  const btnExcluirTodos = document.getElementById("btnExcluirTodos");

  let alertas = [];

  function obterNivel(alerta) {
    const tipo = String(alerta.tipo_alerta || alerta.nivel || "").toLowerCase();

    if (tipo.includes("crit")) return "critico";
    if (tipo.includes("aviso") || tipo.includes("alerta")) return "aviso";

    return "normal";
  }

  function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;

    elemento.textContent = texto ?? "—";

    return elemento;
  }

  function renderizar() {
    lista.replaceChildren();

    const termo = campoBusca.value.trim().toLowerCase();
    const nivelSelecionado = filtroNivel.value;

    const filtrados = alertas.filter((alerta) => {
      const nivel = obterNivel(alerta);

      const texto = String(alerta.mensagem || "").toLowerCase();

      return (
        texto.includes(termo) &&
        (nivelSelecionado === "todos" || nivel === nivelSelecionado)
      );
    });

    filtrados.forEach((alerta) => {
      const nivel = obterNivel(alerta);

      const linha = document.createElement("div");
      linha.className = "linha-alerta";
      linha.dataset.nivel = nivel;

      const colunaNivel = document.createElement("div");
      const etiqueta = criarElemento(
        "span",
        `nivel ${nivel}`,
        nivel === "critico"
          ? "Crítico"
          : nivel === "aviso"
            ? "Aviso"
            : "Normal",
      );

      colunaNivel.appendChild(etiqueta);

      const colunaMensagem = criarElemento("div", "mensagem", "");
      colunaMensagem.appendChild(
        criarElemento("strong", "", alerta.mensagem || "Alerta"),
      );

      const colunaValor = criarElemento(
        "div",
        "valor",
        alerta.valor_vibracao ? `${alerta.valor_vibracao} mm/s` : "—",
      );

      const colunaSensor = criarElemento(
        "div",
        "sensor",
        alerta.id_sensor_fk
          ? `Sensor ${alerta.id_sensor_fk}`
          : alerta.id_leitura_fk
            ? `Leitura ${alerta.id_leitura_fk}`
            : "Não identificado",
      );

      const data = alerta.data_criacao ? new Date(alerta.data_criacao) : null;

      const horario =
        data && !Number.isNaN(data.getTime())
          ? data.toLocaleTimeString("pt-BR")
          : "—";

      const colunaHora = criarElemento("div", "hora", horario);

      linha.append(
        colunaNivel,
        colunaMensagem,
        colunaValor,
        colunaSensor,
        colunaHora,
      );

      lista.appendChild(linha);
    });

    contadorCriticos.textContent = alertas.filter(
      (alerta) => obterNivel(alerta) === "critico",
    ).length;

    contadorTotal.textContent = alertas.length;

    estado.hidden = filtrados.length > 0;

    if (!filtrados.length && alertas.length) {
      estado.textContent = "Nenhum alerta corresponde à pesquisa.";
    } else if (!alertas.length) {
      estado.textContent = "Nenhum alerta disponível.";
    }

    btnExcluirTodos.disabled = alertas.length === 0;
  }

  async function carregarAlertas() {
    try {
      const resposta = await window.PulseMineAlertasService.listar();

      alertas = Array.isArray(resposta)
        ? resposta
        : Array.isArray(resposta?.data)
          ? resposta.data
          : [];

      renderizar();
    } catch (erro) {
      alertas = [];
      renderizar();

      estado.hidden = false;
      estado.textContent = `Não foi possível carregar os alertas: ${erro.message}`;
    }
  }

  campoBusca.addEventListener("input", renderizar);
  filtroNivel.addEventListener("change", renderizar);

  btnExcluirTodos.addEventListener("click", () => {
    window.alert(
      "A exclusão não está disponível porque o Back-end ainda não possui uma rota para essa operação.",
    );
  });

  carregarAlertas();
});
