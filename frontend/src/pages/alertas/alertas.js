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
    if (tipo.includes("aviso") || tipo.includes("alerta")) {
      return "aviso";
    }

    return "normal";
  }

  function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
      elemento.className = classe;
    }

    elemento.textContent = texto ?? "—";

    return elemento;
  }

  function obterData(alerta) {
    const valor =
      alerta.data_criacao ||
      alerta.data_hora ||
      alerta.data_leitura ||
      alerta.created_at;

    if (!valor) return null;

    const data =
      typeof valor === "string" &&
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(valor)
        ? new Date(valor.replace(" ", "T"))
        : new Date(valor);

    return Number.isNaN(data.getTime()) ? null : data;
  }

  function renderizar() {
    if (!lista) return;

    lista.replaceChildren();

    const termo = campoBusca?.value.trim().toLowerCase() || "";
    const nivelSelecionado = filtroNivel?.value || "todos";

    const filtrados = alertas.filter((alerta) => {
      const nivel = obterNivel(alerta);

      const texto = [alerta.mensagem, alerta.dispositivo, alerta.id_sensor_fk]
        .join(" ")
        .toLowerCase();

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
        nivel === "critico" ? "Crítico" : "Aviso",
      );

      colunaNivel.appendChild(etiqueta);

      const colunaMensagem = criarElemento("div", "mensagem", "");

      colunaMensagem.appendChild(
        criarElemento("strong", "", alerta.mensagem || "Alerta"),
      );

      const valor = Number(alerta.valor_vibracao);

      const colunaValor = criarElemento(
        "div",
        "valor",
        Number.isFinite(valor)
          ? `${valor.toFixed(2).replace(".", ",")} mm/s`
          : "—",
      );

      const nomeSensor =
        alerta.dispositivo ||
        (alerta.id_sensor_fk
          ? `Sensor ${alerta.id_sensor_fk}`
          : "Não identificado");

      const colunaSensor = criarElemento("div", "sensor", nomeSensor);

      const data = obterData(alerta);

      const horario = data
        ? data.toLocaleTimeString("pt-BR")
        : alerta.numero_leitura
          ? `Leitura ${alerta.numero_leitura}`
          : "—";

      const colunaHora = criarElemento("div", "hora", horario);

      linha.append(
        colunaNivel,
        colunaMensagem,
        colunaValor,
        colunaSensor,
        colunaHora,
        document.createElement("div"),
      );

      lista.appendChild(linha);
    });

    if (contadorCriticos) {
      contadorCriticos.textContent = alertas.filter(
        (alerta) => obterNivel(alerta) === "critico",
      ).length;
    }

    if (contadorTotal) {
      contadorTotal.textContent = alertas.length;
    }

    if (estado) {
      estado.hidden = filtrados.length > 0;

      if (!filtrados.length && alertas.length) {
        estado.textContent = "Nenhum alerta corresponde à pesquisa.";
      } else if (!alertas.length) {
        estado.textContent = "Nenhuma leitura acima do limite de atenção.";
      }
    }
  }

  async function carregarAlertas() {
    try {
      alertas = await window.PulseMineAlertasService.listar();

      renderizar();
    } catch (erro) {
      alertas = [];
      renderizar();

      if (estado) {
        estado.hidden = false;
        estado.textContent = `Não foi possível carregar os avisos: ${erro.message}`;
      }
    }
  }

  campoBusca?.addEventListener("input", renderizar);
  filtroNivel?.addEventListener("change", renderizar);

  if (btnExcluirTodos) {
    btnExcluirTodos.disabled = true;
    btnExcluirTodos.title =
      "O backend atual ainda não possui uma rota para excluir alertas.";
  }

  carregarAlertas();

  setInterval(carregarAlertas, 10000);
});
