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

  const btnConfiguracoes = elemento("btnConfiguracoes");
  const modalConfiguracoes = elemento("modalConfiguracoes");
  const formConfiguracoes = elemento("formConfiguracoes");
  const limiteAtencaoInput = elemento("limiteAtencao");
  const limiteCriticoInput = elemento("limiteCritico");
  const erroConfiguracao = elemento("erroConfiguracao");
  const btnFecharConfiguracoes = elemento("btnFecharConfiguracoes");
  const btnCancelarConfiguracoes = elemento("btnCancelarConfiguracoes");

  const mensagemToast = elemento("mensagemToast");
  const sensorSelecionado = elemento("sensorSelecionado");
  const btnNovoSensor = elemento("btnNovoSensor");
  const btnSalvarSensor = elemento("btnSalvarSensor");
  const sensorNome = elemento("sensorNome");
  const sensorLocal = elemento("sensorLocal");
  const sensorStatus = elemento("sensorStatus");
  const erroSensor = elemento("erroSensor");

  let sensores = [];

  let limiteAtencao = 4;
  let limiteCritico = 7;
  let periodoMinutos = 10;
  let temporizadorToast;

  let vibracaoAtual = 2.45;
  let ultimaClassificacao = null;

  let historico = Array.from({ length: 30 }, () =>
    Number((1.8 + Math.random() * 1.2).toFixed(2)),
  );

  vibracaoAtual = historico[historico.length - 1];

  let notificacoes = [];

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

    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();

    const horas = String(agora.getHours()).padStart(2, "0");
    const minutos = String(agora.getMinutes()).padStart(2, "0");
    const segundos = String(agora.getSeconds()).padStart(2, "0");

    if (dataAtual) {
      dataAtual.textContent = `${dia}/${mes}/${ano}`;
    }

    if (horaAtual) {
      horaAtual.textContent = `${horas}:${minutos}:${segundos}`;
    }
  }

  function mostrarMensagem(mensagem) {
    if (!mensagemToast) return;

    mensagemToast.textContent = mensagem;
    definirVisibilidade(mensagemToast, true);

    clearTimeout(temporizadorToast);

    temporizadorToast = setTimeout(() => {
      definirVisibilidade(mensagemToast, false);
    }, 3000);
  }

  function obterStatus(valor) {
    if (valor >= limiteCritico) {
      return {
        classe: "critico",
        texto: "Crítico",
      };
    }

    if (valor >= limiteAtencao) {
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

  function atualizarStatusVibracao() {
    if (valorVibracao) {
      valorVibracao.textContent = vibracaoAtual.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (!statusVibracao) return;

    const status = obterStatus(vibracaoAtual);

    statusVibracao.textContent = status.texto;

    statusVibracao.classList.remove(
      "status-normal",
      "status-atencao",
      "status-critico",
    );

    statusVibracao.classList.add(`status-${status.classe}`);

    const cores = {
      normal: "#28a745",
      atencao: "#f0ad4e",
      critico: "#ff4d4f",
    };

    statusVibracao.style.color = cores[status.classe];
  }

  function obterHistoricoVisivel() {
    return historico.slice(-periodoMinutos);
  }

  function atualizarIndicadores() {
    const leituras = obterHistoricoVisivel();

    const totalAlertas = leituras.filter(
      (valor) => valor >= limiteAtencao,
    ).length;

    if (valorAlertas) {
      valorAlertas.textContent = totalAlertas;
    }

    if (statusAlertas) {
      statusAlertas.textContent =
        totalAlertas === 0
          ? "Nenhum alerta no período"
          : totalAlertas === 1
            ? "1 leitura acima do limite"
            : `${totalAlertas} leituras acima do limite`;
    }

    if (valorEquipamentos) {
      valorEquipamentos.textContent = "12";
    }

    if (statusEquipamentos) {
      statusEquipamentos.textContent = "Em operação";
    }

    if (valorSensores) {
      valorSensores.textContent = "24";
    }

    if (statusSensores) {
      statusSensores.textContent = "Conectados";
    }

    atualizarStatusVibracao();
  }

  function atualizarGrafico() {
    const valores = obterHistoricoVisivel();

    if (!linhaGrafico || valores.length === 0) return;

    const largura = 600;
    const linhaBase = 190;
    const alturaUtil = 155;
    const valorMaximoGrafico = 10;

    const pontos = valores.map((valor, indice) => {
      const x =
        valores.length === 1
          ? largura / 2
          : (indice / (valores.length - 1)) * largura;

      const valorLimitado = Math.max(0, Math.min(valor, valorMaximoGrafico));

      const y = linhaBase - (valorLimitado / valorMaximoGrafico) * alturaUtil;

      return {
        x,
        y,
      };
    });

    const caminhoLinha = pontos
      .map((ponto, indice) => {
        const comando = indice === 0 ? "M" : "L";
        return `${comando} ${ponto.x.toFixed(2)} ${ponto.y.toFixed(2)}`;
      })
      .join(" ");

    linhaGrafico.setAttribute("d", caminhoLinha);

    if (areaGrafico) {
      const primeiroPonto = pontos[0];
      const ultimoPonto = pontos[pontos.length - 1];

      const caminhoArea = [
        `M ${primeiroPonto.x.toFixed(2)} ${linhaBase}`,
        caminhoLinha,
        `L ${ultimoPonto.x.toFixed(2)} ${linhaBase}`,
        "Z",
      ].join(" ");

      areaGrafico.setAttribute("d", caminhoArea);
    }

    atualizarEixoX();
  }

  function atualizarEixoX() {
    if (!eixoX) return;

    const quantidadeMarcacoes = 6;
    const marcacoesExistentes = Array.from(eixoX.querySelectorAll("text"));

    while (marcacoesExistentes.length < quantidadeMarcacoes) {
      const texto = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );

      eixoX.appendChild(texto);
      marcacoesExistentes.push(texto);
    }

    const intervalo = periodoMinutos / (quantidadeMarcacoes - 1);

    marcacoesExistentes.forEach((marcacao, indice) => {
      if (indice >= quantidadeMarcacoes) {
        marcacao.remove();
        return;
      }

      const minutosAtras = Math.round(periodoMinutos - intervalo * indice);

      marcacao.textContent =
        minutosAtras === 0 ? "Agora" : `-${minutosAtras} min`;

      marcacao.setAttribute(
        "x",
        String((indice / (quantidadeMarcacoes - 1)) * 600),
      );

      marcacao.setAttribute("y", "215");
      marcacao.setAttribute("text-anchor", "middle");
    });
  }

  function adicionarNotificacao(titulo, mensagem, tipo = "info") {
    const notificacao = {
      id: Date.now() + Math.random(),
      titulo,
      mensagem,
      tipo,
      horario: new Date(),
      lida: false,
    };

    notificacoes.unshift(notificacao);

    if (notificacoes.length > 30) {
      notificacoes = notificacoes.slice(0, 30);
    }

    renderizarNotificacoes();
  }

  function renderizarNotificacoes() {
    if (!listaNotificacoes) return;

    listaNotificacoes.replaceChildren();

    if (notificacoes.length === 0) {
      const itemVazio = document.createElement("li");
      itemVazio.textContent = "Nenhuma notificação.";
      itemVazio.className = "notificacao-vazia";

      listaNotificacoes.appendChild(itemVazio);
    }

    notificacoes.forEach((notificacao) => {
      const item = document.createElement("li");
      item.className = "notificacao-item";

      if (notificacao.lida) {
        item.classList.add("lida");
      }

      item.classList.add(`notificacao-${notificacao.tipo}`);

      const titulo = document.createElement("strong");
      titulo.textContent = notificacao.titulo;

      const mensagem = document.createElement("p");
      mensagem.textContent = notificacao.mensagem;

      const horario = document.createElement("small");
      horario.textContent = notificacao.horario.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      item.append(titulo, mensagem, horario);
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

  function marcarNotificacoesComoLidas() {
    notificacoes = notificacoes.map((notificacao) => ({
      ...notificacao,
      lida: true,
    }));

    renderizarNotificacoes();
    mostrarMensagem("Notificações marcadas como lidas.");
  }

  function abrirConfiguracoes() {
    if (limiteAtencaoInput) {
      limiteAtencaoInput.value = limiteAtencao;
    }

    if (limiteCriticoInput) {
      limiteCriticoInput.value = limiteCritico;
    }

    if (erroConfiguracao) {
      erroConfiguracao.textContent = "";
    }

    definirVisibilidade(modalConfiguracoes, true);
  }

  function fecharConfiguracoes() {
    definirVisibilidade(modalConfiguracoes, false);
  }

  function carregarConfiguracoes() {
    try {
      const dados = localStorage.getItem("pulseMineConfiguracoes");

      if (!dados) return;

      const configuracoes = JSON.parse(dados);

      const atencao = Number(configuracoes.limiteAtencao);
      const critico = Number(configuracoes.limiteCritico);

      if (
        Number.isFinite(atencao) &&
        Number.isFinite(critico) &&
        atencao > 0 &&
        critico > atencao
      ) {
        limiteAtencao = atencao;
        limiteCritico = critico;
      }
    } catch (erro) {
      console.error("Não foi possível carregar as configurações:", erro);
    }
  }

  function salvarConfiguracoes(evento) {
    evento.preventDefault();

    const novoLimiteAtencao = Number(limiteAtencaoInput?.value);

    const novoLimiteCritico = Number(limiteCriticoInput?.value);

    if (
      !Number.isFinite(novoLimiteAtencao) ||
      !Number.isFinite(novoLimiteCritico) ||
      novoLimiteAtencao <= 0 ||
      novoLimiteCritico <= novoLimiteAtencao
    ) {
      if (erroConfiguracao) {
        erroConfiguracao.textContent =
          "Informe limites positivos e faça o limite crítico ser maior que o de atenção.";
      }

      return;
    }

    limiteAtencao = novoLimiteAtencao;
    limiteCritico = novoLimiteCritico;

    try {
      localStorage.setItem(
        "pulseMineConfiguracoes",
        JSON.stringify({
          limiteAtencao,
          limiteCritico,
        }),
      );
    } catch (erro) {
      console.error("Não foi possível salvar as configurações:", erro);
    }

    if (erroConfiguracao) {
      erroConfiguracao.textContent = "";
    }

    atualizarIndicadores();
    atualizarGrafico();
    fecharConfiguracoes();

    adicionarNotificacao(
      "Configurações atualizadas",
      `Atenção: ${limiteAtencao}. Crítico: ${limiteCritico}.`,
      "info",
    );

    mostrarMensagem("Configurações salvas.");
  }

  function alternarPeriodo() {
    periodoMinutos = periodoMinutos === 10 ? 30 : 10;

    if (btnPeriodo) {
      btnPeriodo.textContent = `Últimos ${periodoMinutos} minutos`;
    }

    atualizarIndicadores();
    atualizarGrafico();
  }

  function simularLeitura() {
    const statusAnterior = obterStatus(vibracaoAtual);

    const variacao = (Math.random() - 0.5) * 0.8;
    let novaLeitura = vibracaoAtual + variacao;

    if (Math.random() < 0.06) {
      novaLeitura = 4 + Math.random() * 4;
    }

    vibracaoAtual = Number(Math.max(0, Math.min(9.5, novaLeitura)).toFixed(2));

    historico.push(vibracaoAtual);

    if (historico.length > 30) {
      historico.shift();
    }

    const statusAtual = obterStatus(vibracaoAtual);

    if (statusAtual.classe !== statusAnterior.classe) {
      if (statusAtual.classe === "critico") {
        adicionarNotificacao(
          "Nível crítico de vibração",
          `A vibração atingiu ${vibracaoAtual.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}. Verifique o equipamento.`,
          "critico",
        );
      } else if (statusAtual.classe === "atencao") {
        adicionarNotificacao(
          "Atenção à vibração",
          `A vibração atingiu ${vibracaoAtual.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}.`,
          "atencao",
        );
      } else {
        adicionarNotificacao(
          "Vibração normalizada",
          "A leitura voltou para a faixa normal.",
          "info",
        );
      }
    }

    atualizarIndicadores();
    atualizarGrafico();
  }

  if (btnNotificacoes) {
    btnNotificacoes.addEventListener("click", () => {
      const painelAberto = painelNotificacoes && !painelNotificacoes.hidden;

      definirVisibilidade(painelNotificacoes, !painelAberto);
    });
  }

  if (btnMarcarLidas) {
    btnMarcarLidas.addEventListener("click", marcarNotificacoesComoLidas);
  }

  if (btnConfiguracoes) {
    btnConfiguracoes.addEventListener("click", abrirConfiguracoes);
  }

  if (btnFecharConfiguracoes) {
    btnFecharConfiguracoes.addEventListener("click", fecharConfiguracoes);
  }

  if (btnCancelarConfiguracoes) {
    btnCancelarConfiguracoes.addEventListener("click", fecharConfiguracoes);
  }

  if (formConfiguracoes) {
    formConfiguracoes.addEventListener("submit", salvarConfiguracoes);
  }

  if (btnPeriodo) {
    btnPeriodo.addEventListener("click", alternarPeriodo);
  }

  if (modalConfiguracoes) {
    modalConfiguracoes.addEventListener("click", (evento) => {
      if (evento.target === modalConfiguracoes) {
        fecharConfiguracoes();
      }
    });
  }

  document.addEventListener("click", (evento) => {
    if (
      painelNotificacoes &&
      btnNotificacoes &&
      !painelNotificacoes.contains(evento.target) &&
      !btnNotificacoes.contains(evento.target)
    ) {
      definirVisibilidade(painelNotificacoes, false);
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      fecharConfiguracoes();
      definirVisibilidade(painelNotificacoes, false);
    }
  });

  carregarConfiguracoes();

  if (limiteAtencaoInput) {
    limiteAtencaoInput.value = limiteAtencao;
  }

  if (limiteCriticoInput) {
    limiteCriticoInput.value = limiteCritico;
  }

  definirVisibilidade(painelNotificacoes, false);
  definirVisibilidade(modalConfiguracoes, false);
  definirVisibilidade(mensagemToast, false);

  atualizarDataHora();
  atualizarIndicadores();
  atualizarGrafico();
  renderizarNotificacoes();

  ultimaClassificacao = obterStatus(vibracaoAtual).classe;

  adicionarNotificacao(
    "Monitoramento iniciado",
    "O painel está utilizando dados simulados.",
    "info",
  );

  setInterval(atualizarDataHora, 1000);
  setInterval(simularLeitura, 5000);

  function carregarSensores() {
    try {
      const dados = localStorage.getItem("pulseMineSensores");
      const resultado = dados ? JSON.parse(dados) : [];

      sensores = Array.isArray(resultado) ? resultado : [];
    } catch (erro) {
      sensores = [];
      console.error("Erro ao carregar sensores:", erro);
    }
  }

  function persistirSensores() {
    try {
      localStorage.setItem("pulseMineSensores", JSON.stringify(sensores));

      return true;
    } catch (erro) {
      console.error("Erro ao salvar sensores:", erro);
      return false;
    }
  }

  function renderizarSensores(idSelecionado = "") {
    if (!sensorSelecionado) return;

    sensorSelecionado.replaceChildren();

    const opcaoNovo = document.createElement("option");
    opcaoNovo.value = "";
    opcaoNovo.textContent = "Novo sensor";
    sensorSelecionado.appendChild(opcaoNovo);

    sensores.forEach((sensor) => {
      const opcao = document.createElement("option");
      opcao.value = sensor.id;
      opcao.textContent = sensor.nome;
      sensorSelecionado.appendChild(opcao);
    });

    sensorSelecionado.value = idSelecionado;
  }

  function limparFormularioSensor() {
    if (sensorSelecionado) sensorSelecionado.value = "";
    if (sensorNome) sensorNome.value = "";
    if (sensorLocal) sensorLocal.value = "";
    if (sensorStatus) sensorStatus.value = "ativo";
    if (erroSensor) erroSensor.textContent = "";
  }

  function preencherFormularioSensor() {
    const id = sensorSelecionado.value;

    if (!id) {
      limparFormularioSensor();
      return;
    }

    const sensor = sensores.find((item) => item.id === id);

    if (!sensor) {
      limparFormularioSensor();
      return;
    }

    sensorNome.value = sensor.nome;
    sensorLocal.value = sensor.localizacao;
    sensorStatus.value = sensor.status;
    erroSensor.textContent = "";
  }

  function salvarSensor() {
    const id = sensorSelecionado.value;
    const nome = sensorNome.value.trim();
    const localizacao = sensorLocal.value.trim();
    const status = sensorStatus.value;

    if (!nome || !localizacao) {
      erroSensor.textContent = "Preencha o nome e a localização do sensor.";
      return;
    }

    if (!["ativo", "inativo"].includes(status)) {
      erroSensor.textContent = "Selecione um estado válido.";
      return;
    }

    const indice = sensores.findIndex((sensor) => sensor.id === id);
    const sensoresAnteriores = [...sensores];

    let idSalvo;
    let mensagem;

    if (id && indice !== -1) {
      sensores[indice] = {
        ...sensores[indice],
        nome,
        localizacao,
        status,
      };

      idSalvo = id;
      mensagem = "Sensor atualizado com sucesso.";
    } else {
      idSalvo = `sensor-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      sensores.push({
        id: idSalvo,
        nome,
        localizacao,
        status,
      });

      mensagem = "Sensor cadastrado com sucesso.";
    }

    if (!persistirSensores()) {
      sensores = sensoresAnteriores;
      erroSensor.textContent = "Não foi possível salvar o sensor no navegador.";
      return;
    }

    renderizarSensores(idSalvo);
    erroSensor.textContent = "";

    mostrarMensagem(mensagem);

    adicionarNotificacao(
      "Sensores atualizados",
      `${nome} — ${status === "ativo" ? "Ativo" : "Inativo"}.`,
      "info",
    );
  }

  if (sensorSelecionado) {
    sensorSelecionado.addEventListener("change", preencherFormularioSensor);
  }

  if (btnNovoSensor) {
    btnNovoSensor.addEventListener("click", () => {
      limparFormularioSensor();

      if (sensorNome) sensorNome.focus();
    });
  }

  if (btnSalvarSensor) {
    btnSalvarSensor.addEventListener("click", salvarSensor);
  }

  carregarSensores();
  renderizarSensores();
});
