document.addEventListener("DOMContentLoaded", () => {
  const campoBusca = document.getElementById("buscarAlertas");
  const filtroNivel = document.getElementById("filtronivel");
  const contadorCriticos = document.getElementById("alertasCriticos");
  const contadorTotal = document.getElementById("totalAlertas");
  const estado = document.getElementById("estadoAlertas");
  const lista = document.getElementById("listaAlertasDados");

  const INTERVALO_ATUALIZACAO = 5000;

  let alertas = [];
  let carregando = false;

  function obterNivel(alerta) {
    const tipo = String(alerta.tipo_alerta || alerta.nivel || "").toLowerCase();

    if (tipo.includes("crit")) return "critico";

    return "aviso";
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

    let data;

    if (
      typeof valor === "string" &&
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(valor)
    ) {
      data = new Date(valor.replace(" ", "T"));
    } else if (typeof valor === "number") {
      data = new Date(valor < 1000000000000 ? valor * 1000 : valor);
    } else {
      data = new Date(valor);
    }

    return Number.isNaN(data.getTime()) ? null : data;
  }

  function formatarValor(valor) {
    if (valor === null || valor === undefined || String(valor).trim() === "") {
      return "—";
    }

    const numero = Number(String(valor).replace(",", "."));

    if (!Number.isFinite(numero)) return "—";

    return `${numero.toFixed(2).replace(".", ",")} mm/s`;
  }

  function renderizar() {
    if (!lista) return;

    lista.replaceChildren();

    const termo = campoBusca?.value.trim().toLowerCase() || "";
    const nivelSelecionado = filtroNivel?.value || "todos";

    const filtrados = alertas
      .filter((alerta) => {
        const nivel = obterNivel(alerta);

        const texto = [
          alerta.mensagem,
          alerta.dispositivo,
          alerta.id_sensor_fk,
          alerta.valor_vibracao,
        ]
          .join(" ")
          .toLowerCase();

        return (
          texto.includes(termo) &&
          (nivelSelecionado === "todos" || nivel === nivelSelecionado)
        );
      })
      .sort((a, b) => {
        const dataA = obterData(a);
        const dataB = obterData(b);

        if (!dataA && !dataB) return 0;
        if (!dataA) return 1;
        if (!dataB) return -1;

        return dataB.getTime() - dataA.getTime();
      });

    filtrados.forEach((alerta) => {
      const nivel = obterNivel(alerta);

      const linha = document.createElement("div");
      linha.className = "linha-alerta";
      linha.dataset.nivel = nivel;

      const colunaNivel = document.createElement("div");

      colunaNivel.appendChild(
        criarElemento(
          "span",
          `nivel ${nivel}`,
          nivel === "critico" ? "Crítico" : "Aviso",
        ),
      );

      const colunaMensagem = criarElemento(
        "div",
        "mensagem",
        alerta.mensagem || "Alerta de vibração",
      );

      const colunaValor = criarElemento(
        "div",
        "valor",
        formatarValor(alerta.valor_vibracao),
      );

      const identificadorSensor =
        alerta.id_sensor_fk ?? alerta.id_sensor ?? null;

      const nomeSensor =
        alerta.dispositivo ||
        (identificadorSensor
          ? `Sensor ${identificadorSensor}`
          : "Não identificado");

      const colunaSensor = criarElemento("div", "sensor", nomeSensor);

      const data = obterData(alerta);

      const horario = data
        ? data.toLocaleString("pt-BR")
        : alerta.numero_leitura
          ? `Leitura ${alerta.numero_leitura}`
          : "Horário não informado";

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

      if (!filtrados.length && alertas.length > 0) {
        estado.textContent =
          "Nenhum aviso corresponde aos filtros selecionados.";
      } else if (!alertas.length) {
        estado.textContent =
          "Nenhuma leitura acima do limite de atenção foi encontrada.";
      }
    }
  }

  async function carregarAlertas() {
    if (carregando || document.visibilityState === "hidden") return;

    carregando = true;

    try {
      if (!window.PulseMineAlertasService) {
        throw new Error("O serviço de alertas não foi carregado.");
      }

      const dados = await window.PulseMineAlertasService.listar();

      if (!Array.isArray(dados)) {
        throw new Error("O servidor retornou uma lista inválida.");
      }

      alertas = dados;
      renderizar();
    } catch (erro) {
      console.error("Erro ao atualizar alertas:", erro);

      if (estado && alertas.length === 0) {
        estado.hidden = false;
        estado.textContent = `Não foi possível carregar os avisos: ${erro.message}`;
      }
    } finally {
      carregando = false;
    }
  }

  campoBusca?.addEventListener("input", renderizar);
  filtroNivel?.addEventListener("change", renderizar);

  carregarAlertas();

  const intervalo = window.setInterval(carregarAlertas, INTERVALO_ATUALIZACAO);

  window.addEventListener("focus", carregarAlertas);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      carregarAlertas();
    }
  });

  window.addEventListener("pagehide", () => {
    window.clearInterval(intervalo);
  });
});
