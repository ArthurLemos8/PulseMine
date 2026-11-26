document.addEventListener("DOMContentLoaded", () => {
  const elemento = (id) => document.getElementById(id);

  const dataAtual = elemento("dataAtual");
  const horaAtual = elemento("horaAtual");

  const valorVibracao = elemento("valorVibracao");
  const statusVibracao = elemento("statusVibracao");
  const valorAlertas = elemento("valorAlertas");
  const statusAlertas = elemento("statusAlertas");
  const valorEquipamentos = elemento("valorEquipamentos");
  const statusEquipamentos = elemento("statusEquipamentos");
  const valorSensores = elemento("valorSensores");
  const statusSensores = elemento("statusSensores");

  const areaGrafico = elemento("areaGrafico");
  const linhaGrafico = elemento("linhaGrafico");
  const eixoX = elemento("eixoX");
  const btnPeriodo = elemento("btnPeriodo");

  const btnNotificacoes = elemento("btnNotificacoes");
  const notificacoesContagem = elemento("notificacoesContagem");
  const painelNotificacoes = elemento("painelNotificacoes");
  const listaNotificacoes = elemento("listaNotificacoes");
  const btnMarcarLidas = elemento("btnMarcarLidas");

  const avisoDados = document.querySelector(".aviso-dados");

  const LIMITE_ATENCAO = 4;
  const LIMITE_CRITICO = 7;

  let leituras = [];
  let periodoMinutos = 10;
  let notificacoes = [];
  let ultimaLeituraProcessada = null;
  let primeiraConsulta = true;
  let carregando = false;
  let temporizadorToast;

  function definirVisibilidade(alvo, visivel) {
    if (!alvo) return;

    alvo.hidden = !visivel;

    if (visivel) {
      alvo.style.removeProperty("display");
    } else {
      alvo.style.display = "none";
    }
  }

  function atualizarDataHora() {
    const agora = new Date();

    if (dataAtual) {
      dataAtual.textContent = agora.toLocaleDateString("pt-BR");
    }

    if (horaAtual) {
      horaAtual.textContent = agora.toLocaleTimeString("pt-BR");
    }
  }

  function mostrarMensagem(mensagem) {
    const toast = elemento("mensagemToast");

    if (!toast) return;

    toast.textContent = mensagem;
    definirVisibilidade(toast, true);

    clearTimeout(temporizadorToast);

    temporizadorToast = setTimeout(() => {
      definirVisibilidade(toast, false);
    }, 3500);
  }

  function obterValor(leitura) {
    const valor = Number(
      String(leitura?.valor_vibracao ?? "").replace(",", "."),
    );

    return Number.isFinite(valor) ? valor : null;
  }

  function obterIdentificador(leitura, indice) {
    const identificador = leitura.id ?? leitura.numero_leitura;

    if (identificador !== undefined && identificador !== null) {
      return String(identificador);
    }

    return `${leitura.id_sensor_fk}-${leitura.valor_vibracao}-${indice}`;
  }

  function obterDataLeitura(leitura) {
    const campos = [
      leitura.data_hora,
      leitura.data_leitura,
      leitura.created_at,
      leitura.data_criacao,
      leitura.timestamp,
    ];

    for (const campo of campos) {
      if (campo === undefined || campo === null || campo === "") {
        continue;
      }

      let data;

      if (typeof campo === "number") {
        data = new Date(campo < 1000000000000 ? campo * 1000 : campo);
      } else if (
        typeof campo === "string" &&
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(campo)
      ) {
        data = new Date(campo.replace(" ", "T"));
      } else {
        data = new Date(campo);
      }

      if (!Number.isNaN(data.getTime())) {
        return data;
      }
    }

    return null;
  }

  function obterStatus(valor) {
    if (valor >= LIMITE_CRITICO) {
      return {
        classe: "critico",
        texto: "Crítico",
      };
    }

    if (valor >= LIMITE_ATENCAO) {
      return {
        classe: "atencao",
        texto: "Atenção",
      };
    }

    return {
      classe: "normal",
      texto: "Normal",
    };
  }

  function atualizarStatusVibracao(valor) {
    if (valorVibracao) {
      valorVibracao.textContent = valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (!statusVibracao) return;

    const status = obterStatus(valor);

    statusVibracao.textContent = status.texto;

    statusVibracao.classList.remove("normal", "atencao", "critico");

    statusVibracao.classList.add(status.classe);

    const cores = {
      normal: "#28a745",
      atencao: "#f0ad4e",
      critico: "#ff4d4f",
    };

    statusVibracao.style.color = cores[status.classe];
  }

  function obterLeiturasVisiveis() {
    const agora = Date.now();
    const limite = agora - periodoMinutos * 60 * 1000;

    return leituras.filter((leitura) => {
      const data = obterDataLeitura(leitura);

      return data && data.getTime() >= limite && data.getTime() <= agora;
    });
  }

  function atualizarIndicadores() {
    const visiveis = obterLeiturasVisiveis();

    if (visiveis.length === 0) {
      if (valorVibracao) valorVibracao.textContent = "—";
      if (valorAlertas) valorAlertas.textContent = "—";
      if (valorEquipamentos) valorEquipamentos.textContent = "—";
      if (valorSensores) valorSensores.textContent = "—";

      if (statusVibracao) statusVibracao.textContent = "Sem leituras";
      if (statusAlertas) statusAlertas.textContent = "Sem dados para calcular";
      if (statusEquipamentos) statusEquipamentos.textContent = "Sem dados";
      if (statusSensores) statusSensores.textContent = "Sem dados";

      return;
    }

    const ultima = visiveis[visiveis.length - 1];
    const valorAtual = obterValor(ultima);

    if (valorAtual !== null) {
      atualizarStatusVibracao(valorAtual);
    }

    const totalAlertas = visiveis.filter((leitura) => {
      const valor = obterValor(leitura);

      return valor !== null && valor >= LIMITE_ATENCAO;
    }).length;

    if (valorAlertas) {
      valorAlertas.textContent = totalAlertas;
    }

    if (statusAlertas) {
      statusAlertas.textContent =
        totalAlertas === 0
          ? "Nenhuma leitura acima do limite"
          : `${totalAlertas} leituras acima de ${LIMITE_ATENCAO} mm/s`;
    }

    const equipamentos = new Set(
      visiveis.map((leitura) => leitura.dispositivo).filter(Boolean),
    );

    const sensores = new Set(
      visiveis
        .map((leitura) => leitura.id_sensor_fk)
        .filter((id) => id !== undefined && id !== null),
    );

    if (valorEquipamentos) {
      valorEquipamentos.textContent = equipamentos.size;
    }

    if (statusEquipamentos) {
      statusEquipamentos.textContent = "Identificados nas leituras";
    }

    if (valorSensores) {
      valorSensores.textContent = sensores.size;
    }

    if (statusSensores) {
      statusSensores.textContent = "Com leituras registradas";
    }
  }

  function atualizarEixoX(valores) {
    if (!eixoX) return;

    const marcacoes = Array.from(eixoX.querySelectorAll("span"));

    if (marcacoes.length === 0) return;

    marcacoes.forEach((marcacao, indice) => {
      const proporcao =
        marcacoes.length === 1 ? 0 : indice / (marcacoes.length - 1);

      const indiceLeitura = Math.round(proporcao * (valores.length - 1));

      const leitura = valores[indiceLeitura];

      if (!leitura) {
        marcacao.textContent = "—";
        return;
      }

      const data = obterDataLeitura(leitura);

      if (data) {
        marcacao.textContent = data.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        marcacao.textContent = `#${leitura.numero_leitura ?? leitura.id ?? indiceLeitura + 1}`;
      }
    });
  }

  function atualizarGrafico() {
    const registros = obterLeiturasVisiveis().filter(
      (leitura) => obterValor(leitura) !== null,
    );

    if (!linhaGrafico) return;

    const marcacoesY = document.querySelectorAll(".eixo-y span");

    if (registros.length === 0) {
      linhaGrafico.setAttribute("d", "");
      areaGrafico?.setAttribute("d", "");

      marcacoesY.forEach((marcacao, indice) => {
        marcacao.textContent = [10, 7.5, 5, 2.5, 0][indice] ?? "—";
      });

      atualizarEixoX([]);
      return;
    }

    const largura = 600;
    const linhaBase = 250;
    const alturaUtil = 250;

    const maiorValor = Math.max(
      10,
      ...registros.map((leitura) => obterValor(leitura)),
    );

    const valorMaximo = Math.ceil(maiorValor / 2.5) * 2.5;

    marcacoesY.forEach((marcacao, indice) => {
      const valor = valorMaximo - (valorMaximo / 4) * indice;

      marcacao.textContent = valor.toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      });
    });

    const pontos = registros.map((leitura, indice) => {
      const valor = obterValor(leitura);

      const x =
        registros.length === 1
          ? largura / 2
          : (indice / (registros.length - 1)) * largura;

      const y = linhaBase - (valor / valorMaximo) * alturaUtil;

      return { x, y };
    });

    const caminhoLinha = pontos
      .map((ponto, indice) => {
        const comando = indice === 0 ? "M" : "L";

        return `${comando} ${ponto.x.toFixed(2)} ${ponto.y.toFixed(2)}`;
      })
      .join(" ");

    linhaGrafico.setAttribute("d", caminhoLinha);

    if (areaGrafico) {
      const primeiro = pontos[0];
      const ultimo = pontos[pontos.length - 1];

      const caminhoArea = [
        `M ${primeiro.x.toFixed(2)} ${linhaBase}`,
        caminhoLinha,
        `L ${ultimo.x.toFixed(2)} ${linhaBase}`,
        "Z",
      ].join(" ");

      areaGrafico.setAttribute("d", caminhoArea);
    }

    atualizarEixoX(registros);
  }

  function renderizarNotificacoes() {
    if (!listaNotificacoes) return;

    listaNotificacoes.replaceChildren();

    if (notificacoes.length === 0) {
      const vazio = document.createElement("div");

      vazio.className = "notificacao-vazia";
      vazio.textContent = "Nenhuma notificação.";

      listaNotificacoes.appendChild(vazio);
    }

    notificacoes.forEach((notificacao) => {
      const item = document.createElement("div");

      item.className = "notificacao-item";

      if (notificacao.lida) {
        item.classList.add("lida");
      }

      item.classList.add(`notificacao-${notificacao.tipo}`);

      const titulo = document.createElement("strong");
      titulo.textContent = notificacao.titulo;

      const descricao = document.createElement("p");
      descricao.textContent = notificacao.mensagem;

      const horario = document.createElement("small");
      horario.textContent = notificacao.horario.toLocaleTimeString("pt-BR");

      item.append(titulo, descricao, horario);
      listaNotificacoes.appendChild(item);
    });

    const naoLidas = notificacoes.filter(
      (notificacao) => !notificacao.lida,
    ).length;

    if (notificacoesContagem) {
      notificacoesContagem.textContent = naoLidas;
      notificacoesContagem.hidden = naoLidas === 0;
    }
  }

  function adicionarNotificacao(titulo, mensagem, tipo) {
    notificacoes.unshift({
      titulo,
      mensagem,
      tipo,
      horario: new Date(),
      lida: false,
    });

    notificacoes = notificacoes.slice(0, 30);

    renderizarNotificacoes();
  }

  function analisarNovasLeituras() {
    if (leituras.length === 0) return;

    const ultima = leituras[leituras.length - 1];

    const chaveAtual = obterIdentificador(ultima, leituras.length - 1);

    let novasLeituras = [];

    if (primeiraConsulta) {
      novasLeituras = [ultima];
      primeiraConsulta = false;
    } else {
      const indiceAnterior = leituras.findIndex(
        (leitura, indice) =>
          obterIdentificador(leitura, indice) === ultimaLeituraProcessada,
      );

      novasLeituras =
        indiceAnterior >= 0 ? leituras.slice(indiceAnterior + 1) : [ultima];
    }

    novasLeituras.forEach((leitura) => {
      const valor = obterValor(leitura);

      if (valor === null || valor < LIMITE_ATENCAO) return;

      const dispositivo = leitura.dispositivo || "Equipamento não identificado";

      if (valor >= LIMITE_CRITICO) {
        adicionarNotificacao(
          "Nível crítico de vibração",
          `${dispositivo}: ${valor.toLocaleString("pt-BR")} mm/s.`,
          "critico",
        );
      } else {
        adicionarNotificacao(
          "Atenção à vibração",
          `${dispositivo}: ${valor.toLocaleString("pt-BR")} mm/s.`,
          "atencao",
        );
      }
    });

    ultimaLeituraProcessada = chaveAtual;
  }

  async function carregarLeituras() {
    if (carregando) return;

    carregando = true;

    try {
      const dados = await window.PulseMineDashboardService.obterLeituras();

      if (!Array.isArray(dados)) {
        throw new Error("O servidor não retornou uma lista de leituras.");
      }

      leituras = dados
        .filter((leitura) => obterValor(leitura) !== null)
        .sort((a, b) => {
          const dataA = obterDataLeitura(a);
          const dataB = obterDataLeitura(b);

          if (!dataA && !dataB) return 0;
          if (!dataA) return -1;
          if (!dataB) return 1;

          return dataA.getTime() - dataB.getTime();
        });

      analisarNovasLeituras();
      atualizarIndicadores();
      atualizarGrafico();

      if (avisoDados) {
        avisoDados.textContent = `Dados recebidos do servidor. ${leituras.length} leituras disponíveis.`;
      }
    } catch (erro) {
      console.error("Erro ao carregar as leituras:", erro);

      if (avisoDados) {
        avisoDados.textContent = erro.message.includes("endereço do servidor")
          ? "Configure o endereço público da API para carregar os dados."
          : `Não foi possível carregar as leituras: ${erro.message}`;
      }
    } finally {
      carregando = false;
    }
  }

  function marcarNotificacoesComoLidas() {
    notificacoes = notificacoes.map((notificacao) => ({
      ...notificacao,
      lida: true,
    }));

    renderizarNotificacoes();
    mostrarMensagem("Notificações marcadas como lidas.");
  }

  function alternarPeriodo() {
    periodoMinutos = periodoMinutos === 10 ? 30 : 10;

    if (btnPeriodo) {
      btnPeriodo.textContent = `Últimos ${periodoMinutos} min`;
    }

    atualizarIndicadores();
    atualizarGrafico();
  }

  if (btnNotificacoes) {
    btnNotificacoes.addEventListener("click", () => {
      const aberto = painelNotificacoes && !painelNotificacoes.hidden;

      definirVisibilidade(painelNotificacoes, !aberto);

      btnNotificacoes.setAttribute("aria-expanded", String(!aberto));
    });
  }

  if (btnMarcarLidas) {
    btnMarcarLidas.addEventListener("click", marcarNotificacoesComoLidas);
  }

  if (btnPeriodo) {
    btnPeriodo.textContent = `Últimos ${periodoMinutos} min`;
    btnPeriodo.addEventListener("click", alternarPeriodo);
  }

  document.addEventListener("click", (evento) => {
    if (
      painelNotificacoes &&
      btnNotificacoes &&
      !painelNotificacoes.contains(evento.target) &&
      !btnNotificacoes.contains(evento.target)
    ) {
      definirVisibilidade(painelNotificacoes, false);

      btnNotificacoes.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      definirVisibilidade(painelNotificacoes, false);

      btnNotificacoes?.setAttribute("aria-expanded", "false");
    }
  });

  definirVisibilidade(painelNotificacoes, false);
  definirVisibilidade(elemento("mensagemToast"), false);

  atualizarDataHora();
  atualizarIndicadores();
  atualizarGrafico();
  renderizarNotificacoes();

  carregarLeituras();

  setInterval(atualizarDataHora, 1000);
  setInterval(carregarLeituras, 10000);
});
