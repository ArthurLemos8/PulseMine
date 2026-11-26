document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const linksIndice = document.querySelectorAll(".indice a");
  const secoes = document.querySelectorAll(".paineis .painel");

  const formEquipamento = $("formEquipamento");
  const formSensor = $("formSensor");

  const listaSensores = $("listaSensores");
  const estadoSensores = $("estadoSensores");

  let carregandoSensores = false;

  function atualizarIndice(idSecao) {
    linksIndice.forEach((link) => {
      const selecionado = link.getAttribute("href") === `#${idSecao}`;

      link.classList.toggle("selecionado", selecionado);

      if (selecionado) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  linksIndice.forEach((link) => {
    link.addEventListener("click", () => {
      atualizarIndice(link.getAttribute("href").substring(1));
    });
  });

  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visiveis = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visiveis.length) {
          atualizarIndice(visiveis[0].target.id);
        }
      },
      {
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    secoes.forEach((secao) => observador.observe(secao));
  }

  function mostrarMensagem(id, texto, tipo) {
    const elemento = $(id);

    if (!elemento) return;

    elemento.textContent = texto;
    elemento.className = `mensagem-formulario ${tipo}`;
    elemento.hidden = false;
  }

  function limparMensagem(id) {
    const elemento = $(id);

    if (!elemento) return;

    elemento.textContent = "";
    elemento.hidden = true;
    elemento.className = "mensagem-formulario";
  }

  function obterIdPlanta(valor) {
    if (!valor) return null;

    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Informe um ID de planta válido.");
    }

    return id;
  }

  function validarResposta(resposta, mensagemPadrao) {
    if (resposta?.success === false) {
      throw new Error(resposta.message || resposta.mensagem || mensagemPadrao);
    }

    return resposta;
  }

  async function enviarFormulario({
    formulario,
    endpoint,
    dados,
    idMensagem,
    botaoTexto,
    mensagemSucesso,
  }) {
    const botao = formulario.querySelector('button[type="submit"]');

    const textoOriginal = botao.innerHTML;

    botao.disabled = true;
    botao.innerHTML = "Enviando...";
    limparMensagem(idMensagem);

    try {
      if (!window.PulseMineAPI) {
        throw new Error("O serviço de API não foi carregado.");
      }

      const resposta = await window.PulseMineAPI.post(endpoint, dados);

      validarResposta(resposta, "O servidor não confirmou o cadastro.");

      mostrarMensagem(idMensagem, mensagemSucesso, "sucesso");

      formulario.reset();

      return true;
    } catch (erro) {
      console.error(`Erro no cadastro ${botaoTexto}:`, erro);

      mostrarMensagem(
        idMensagem,
        `Não foi possível cadastrar. ${erro.message}`,
        "erro",
      );

      return false;
    } finally {
      botao.disabled = false;
      botao.innerHTML = textoOriginal;
    }
  }

  formEquipamento?.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    limparMensagem("mensagemEquipamento");

    const nome = $("nomeEquipamento").value.trim();
    const tipo = $("tipoEquipamento").value.trim();
    const status = $("statusEquipamento").value;

    if (!nome) {
      mostrarMensagem(
        "mensagemEquipamento",
        "Informe o nome do equipamento.",
        "erro",
      );

      $("nomeEquipamento").focus();
      return;
    }

    let idPlanta;

    try {
      idPlanta = obterIdPlanta($("plantaEquipamento").value.trim());
    } catch (erro) {
      mostrarMensagem("mensagemEquipamento", erro.message, "erro");
      return;
    }

    const dados = {
      nome_equipamento: nome,
      tipo: tipo || null,
      status_equi: status,
      id_planta_fk: idPlanta,
    };

    await enviarFormulario({
      formulario: formEquipamento,
      endpoint: "/equipamentos",
      dados,
      idMensagem: "mensagemEquipamento",
      botaoTexto: "equipamento",
      mensagemSucesso: "Equipamento cadastrado com sucesso.",
    });
  });

  formSensor?.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    limparMensagem("mensagemSensor");

    const tipoSensor = $("tipoSensor").value.trim();
    const situacao = $("situacaoSensor").value;

    if (!tipoSensor) {
      mostrarMensagem("mensagemSensor", "Informe o tipo do sensor.", "erro");

      $("tipoSensor").focus();
      return;
    }

    if (!["true", "false"].includes(situacao)) {
      mostrarMensagem(
        "mensagemSensor",
        "Selecione uma situação válida para o sensor.",
        "erro",
      );
      return;
    }

    let idPlanta;

    try {
      idPlanta = obterIdPlanta($("plantaSensor").value.trim());
    } catch (erro) {
      mostrarMensagem("mensagemSensor", erro.message, "erro");
      return;
    }

    const dados = {
      tipo_sensor: tipoSensor,
      situacao: situacao === "true",
      id_planta_fk: idPlanta,
    };

    const cadastrado = await enviarFormulario({
      formulario: formSensor,
      endpoint: "/sensores",
      dados,
      idMensagem: "mensagemSensor",
      botaoTexto: "sensor",
      mensagemSucesso: "Sensor cadastrado com sucesso.",
    });

    if (cadastrado) {
      carregarSensores();
    }
  });

  function mostrarEstadoSensor(texto, tipo = "") {
    if (!estadoSensores) return;

    estadoSensores.textContent = texto;
    estadoSensores.className = `estado-sensores ${tipo}`.trim();
  }

  function criarItemSensor(sensor) {
    const item = document.createElement("article");
    item.className = "sensor-item";

    const informacoes = document.createElement("div");
    informacoes.className = "sensor-item-info";

    const nome = document.createElement("strong");
    nome.textContent = `Sensor ${sensor.id}`;

    const dispositivo = document.createElement("span");
    dispositivo.textContent = sensor.dispositivo
      ? `Dispositivo: ${sensor.dispositivo}`
      : "Dispositivo não identificado";

    const descricao = document.createElement("small");
    descricao.textContent = "Identificado nas leituras recebidas do servidor";

    informacoes.append(nome, dispositivo, descricao);

    const icone = document.createElement("i");
    icone.className = "fa-solid fa-microchip";
    icone.setAttribute("aria-hidden", "true");

    item.append(informacoes, icone);

    return item;
  }

  async function carregarSensores() {
    if (!listaSensores || carregandoSensores) return;

    carregandoSensores = true;
    listaSensores.replaceChildren();

    mostrarEstadoSensor("Carregando sensores...");

    try {
      if (!window.PulseMineDashboardService) {
        throw new Error("O serviço de leituras não foi carregado.");
      }

      const leituras = await window.PulseMineDashboardService.obterLeituras();

      if (!Array.isArray(leituras)) {
        throw new Error(
          "O servidor não retornou uma lista válida de leituras.",
        );
      }

      const sensores = new Map();

      leituras.forEach((leitura) => {
        const id = leitura.id_sensor_fk;

        if (id === undefined || id === null) {
          return;
        }

        const identificador = String(id);

        if (!sensores.has(identificador)) {
          sensores.set(identificador, {
            id: identificador,
            dispositivo: leitura.dispositivo || "",
          });
        } else if (
          !sensores.get(identificador).dispositivo &&
          leitura.dispositivo
        ) {
          sensores.get(identificador).dispositivo = leitura.dispositivo;
        }
      });

      const lista = Array.from(sensores.values()).sort(
        (a, b) => Number(a.id) - Number(b.id),
      );

      if (lista.length === 0) {
        mostrarEstadoSensor(
          "Nenhum sensor foi identificado nas leituras recebidas.",
        );
        return;
      }

      lista.forEach((sensor) => {
        listaSensores.appendChild(criarItemSensor(sensor));
      });

      mostrarEstadoSensor(
        `${lista.length} sensor(es) identificado(s) nas leituras.`,
        "sucesso",
      );
    } catch (erro) {
      console.error("Erro ao carregar sensores:", erro);

      mostrarEstadoSensor(
        `Não foi possível carregar os sensores: ${erro.message}`,
        "erro",
      );
    } finally {
      carregandoSensores = false;
    }
  }

  formEquipamento?.addEventListener("reset", () => {
    limparMensagem("mensagemEquipamento");
  });

  formSensor?.addEventListener("reset", () => {
    limparMensagem("mensagemSensor");
  });

  carregarSensores();

  window.setInterval(carregarSensores, 10000);
});
