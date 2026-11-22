document.addEventListener("DOMContentLoaded", () => {
  const campoBusca = document.getElementById("buscarAlertas");
  const filtroNivel = document.getElementById("filtronivel");
  const contadorCriticos = document.getElementById("alertasCriticos");
  const contadorTotal = document.getElementById("totalAlertas");
  const listaAlertas = document.querySelector(".lista-alertas");
  const btnExcluirTodos = document.getElementById("btnExcluirTodos");

  if (!listaAlertas) return;

  const chaveArmazenamento = "pulseMineAlertasEstado";
  const linhasIniciais = Array.from(
    listaAlertas.querySelectorAll(".linha-alerta"),
  );

  function carregarEstado() {
    try {
      const dados = localStorage.getItem(chaveArmazenamento);
      return dados ? JSON.parse(dados) : {};
    } catch (erro) {
      console.error("Não foi possível carregar os alertas salvos:", erro);
      return {};
    }
  }

  const estadoSalvo = carregarEstado();
  const alteracoesSalvas =
    estadoSalvo.alteracoes && typeof estadoSalvo.alteracoes === "object"
      ? estadoSalvo.alteracoes
      : {};
  const niveisAntigos =
    estadoSalvo.niveis && typeof estadoSalvo.niveis === "object"
      ? estadoSalvo.niveis
      : {};
  const alertasRemovidos = new Set(
    Array.isArray(estadoSalvo.removidos) ? estadoSalvo.removidos : [],
  );

  function obterLinhas() {
    return Array.from(listaAlertas.querySelectorAll(".linha-alerta"));
  }

  function obterTextoNivel(nivel) {
    const textos = {
      critico: "Crítico",
      aviso: "Aviso",
      normal: "Normal",
    };

    return textos[nivel] || "Crítico";
  }

  function obterIconeNivel(nivel) {
    const icones = {
      critico: "bi bi-exclamation-triangle",
      aviso: "bi bi-exclamation-circle",
      normal: "bi bi-check-circle",
    };

    return icones[nivel] || icones.critico;
  }

  function aplicarNivel(linha, nivel) {
    const niveisPermitidos = ["critico", "aviso", "normal"];
    const nivelValido = niveisPermitidos.includes(nivel) ? nivel : "critico";
    const etiqueta = linha.querySelector(".nivel");

    linha.dataset.nivel = nivelValido;

    if (!etiqueta) return;

    etiqueta.classList.remove("critico", "aviso", "normal");
    etiqueta.classList.add(nivelValido);
    etiqueta.replaceChildren();

    const icone = document.createElement("i");
    icone.className = obterIconeNivel(nivelValido);
    etiqueta.append(
      icone,
      document.createTextNode(` ${obterTextoNivel(nivelValido)}`),
    );
  }
  function aplicarSensor(linha, identificacaoCompleta) {
    const partes = String(
      identificacaoCompleta || "Sensor não identificado",
    ).split(/\s+—\s+/);

    let sensor = linha.querySelector(".sensor");

    if (!sensor) {
      sensor = document.createElement("div");
      sensor.className = "sensor";

      const valor = linha.querySelector(".valor");

      if (valor) {
        linha.insertBefore(sensor, valor);
      } else {
        linha.appendChild(sensor);
      }
    }

    let identificacao = sensor.querySelector("strong");

    if (!identificacao) {
      identificacao = document.createElement("strong");
      sensor.appendChild(identificacao);
    }

    let descricao = sensor.querySelector("p");

    if (!descricao) {
      descricao = document.createElement("p");
      sensor.appendChild(descricao);
    }

    identificacao.textContent = partes[0].trim();

    descricao.textContent =
      partes.slice(1).join(" — ").trim() || "Sensor de origem";
  }
  function atualizarBotoesMenu(linha) {
    const resolvido = linha.dataset.nivel === "normal";
    const normalDeOrigem = linha.dataset.nivelOriginal === "normal";

    const botaoResolver = linha.querySelector('[data-acao="resolver"]');
    const botaoReabrir = linha.querySelector('[data-acao="reabrir"]');

    if (botaoResolver) {
      botaoResolver.hidden = resolvido;
    }

    if (botaoReabrir) {
      botaoReabrir.hidden = !resolvido || normalDeOrigem;
    }
  }

  function criarMenuAcoes(linha) {
    const botaoMenu = linha.querySelector(".btn-menu");

    if (!botaoMenu) return;

    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir opções do alerta");
    botaoMenu.title = "Opções do alerta";

    const menu = document.createElement("div");
    menu.className = "menu-alerta-acoes";
    menu.hidden = true;

    const botoes = [
      { acao: "editar", texto: "Editar alerta" },
      { acao: "resolver", texto: "Marcar como resolvido" },
      { acao: "reabrir", texto: "Reabrir alerta" },
      {
        acao: "excluir",
        texto: "Excluir alerta",
        classe: "acao-excluir-alerta",
      },
    ];

    botoes.forEach((item) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = `acao-menu-alerta ${item.classe || ""}`.trim();
      botao.dataset.acao = item.acao;
      botao.textContent = item.texto;
      menu.appendChild(botao);
    });

    linha.appendChild(menu);
    atualizarBotoesMenu(linha);
  }

  function mostrarAviso(mensagem) {
    let aviso = document.getElementById("avisoAlertas");

    if (!aviso) {
      aviso = document.createElement("div");
      aviso.id = "avisoAlertas";
      aviso.className = "aviso-alertas";
      aviso.setAttribute("role", "status");
      document.body.appendChild(aviso);
    }

    aviso.textContent = mensagem;
    aviso.classList.add("visivel");

    clearTimeout(mostrarAviso.temporizador);
    mostrarAviso.temporizador = setTimeout(() => {
      aviso.classList.remove("visivel");
    }, 2800);
  }

  function criarModalEdicao() {
    const modal = document.createElement("div");
    modal.id = "modalEditarAlerta";
    modal.className = "modal-editar-alerta";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="conteudo-modal-alerta" role="dialog" aria-modal="true" aria-labelledby="tituloModalAlerta">
        <div class="cabecalho-modal-alerta">
          <div>
            <h2 id="tituloModalAlerta">Editar alerta</h2>
            <p>Atualize as informações e o sensor de origem.</p>
          </div>
          <button type="button" class="fechar-modal-alerta" aria-label="Fechar">&times;</button>
        </div>
        <form id="formEditarAlerta">
          <label for="editarTituloAlerta">Título do alerta</label>
          <input id="editarTituloAlerta" name="titulo" type="text" maxlength="100" required>

          <label for="editarDescricaoAlerta">Descrição</label>
          <textarea id="editarDescricaoAlerta" name="descricao" rows="2" maxlength="180" required></textarea>

          <div class="campos-modal-alerta">
            <div>
              <label for="editarNivelAlerta">Nível</label>
              <select id="editarNivelAlerta" name="nivel" required>
                <option value="critico">Crítico</option>
                <option value="aviso">Aviso</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            <div>
              <label for="editarSensorAlerta">Sensor de origem</label>
              <input id="editarSensorAlerta" name="sensor" type="text" maxlength="100" placeholder="Ex.: SN-001 — Motor Principal" required>
            </div>
          </div>

          <div class="campos-modal-alerta">
            <div>
              <label for="editarValorAlerta">Valor registrado</label>
              <input id="editarValorAlerta" name="valor" type="text" maxlength="40" required>
            </div>
            <div>
              <label for="editarLimiteAlerta">Limite configurado</label>
              <input id="editarLimiteAlerta" name="limite" type="text" maxlength="40" required>
            </div>
          </div>

          <div class="acoes-modal-alerta">
            <button type="button" class="btn-cancelar-modal">Cancelar</button>
            <button type="submit" class="btn-salvar-modal">Salvar alterações</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  const modal = criarModalEdicao();
  const formEdicao = document.getElementById("formEditarAlerta");
  let linhaEmEdicao = null;

  function fecharModal() {
    modal.hidden = true;
    linhaEmEdicao = null;
  }

  function abrirModal(linha) {
    linhaEmEdicao = linha;

    document.getElementById("editarTituloAlerta").value =
      linha.querySelector(".mensagem strong")?.textContent.trim() || "";
    document.getElementById("editarDescricaoAlerta").value =
      linha.querySelector(".mensagem p")?.textContent.trim() || "";
    document.getElementById("editarNivelAlerta").value =
      linha.dataset.nivel || "critico";

    const identificacaoSensor =
      linha.querySelector(".sensor strong")?.textContent.trim() || "";
    const nomeSensor =
      linha.querySelector(".sensor p")?.textContent.trim() || "";

    document.getElementById("editarSensorAlerta").value =
      `${identificacaoSensor} — ${nomeSensor}`.trim();

    document.getElementById("editarValorAlerta").value =
      linha.querySelector(".valor strong")?.textContent.trim() || "";

    document.getElementById("editarLimiteAlerta").value = (
      linha.querySelector(".valor p")?.textContent || ""
    )
      .replace(/^Limite\s*:\s*/i, "")
      .trim();

    fecharMenus();
    modal.hidden = false;
    document.getElementById("editarTituloAlerta").focus();
  }

  function salvarEdicao(evento) {
    evento.preventDefault();

    if (!linhaEmEdicao) return;

    const titulo = document.getElementById("editarTituloAlerta").value.trim();
    const descricao = document
      .getElementById("editarDescricaoAlerta")
      .value.trim();
    const nivel = document.getElementById("editarNivelAlerta").value;
    const sensor = document.getElementById("editarSensorAlerta").value.trim();
    const valor = document.getElementById("editarValorAlerta").value.trim();
    const limite = document.getElementById("editarLimiteAlerta").value.trim();

    if (!titulo || !descricao || !sensor || !valor || !limite) return;

    linhaEmEdicao.querySelector(".mensagem strong").textContent = titulo;
    linhaEmEdicao.querySelector(".mensagem p").textContent = descricao;
    linhaEmEdicao.querySelector(".valor strong").textContent = valor;
    linhaEmEdicao.querySelector(".valor p").textContent = `Limite: ${limite}`;

    aplicarSensor(linhaEmEdicao, sensor);

    if (nivel !== "normal") {
      linhaEmEdicao.dataset.nivelOriginal = nivel;
    }

    aplicarNivel(linhaEmEdicao, nivel);
    atualizarBotoesMenu(linhaEmEdicao);
    linhaEmEdicao.querySelector(".hora").textContent =
      new Date().toLocaleTimeString("pt-BR");

    fecharModal();
    salvarEstado();
    filtrarAlertas();
    mostrarAviso("Alerta atualizado com sucesso.");
  }

  function fecharMenus() {
    listaAlertas.querySelectorAll(".menu-alerta-acoes").forEach((menu) => {
      menu.hidden = true;
    });

    listaAlertas.querySelectorAll(".btn-menu").forEach((botao) => {
      botao.setAttribute("aria-expanded", "false");
    });
  }

  function atualizarResumo() {
    const linhas = obterLinhas();

    const quantidadeCritica = linhas.filter(
      (linha) => linha.dataset.nivel === "critico",
    ).length;

    if (contadorCriticos) {
      contadorCriticos.textContent = quantidadeCritica;
    }

    if (contadorTotal) {
      contadorTotal.textContent = linhas.length;
    }
  }

  function filtrarAlertas() {
    const termo = campoBusca
      ? campoBusca.value.trim().toLocaleLowerCase("pt-BR")
      : "";

    const nivelSelecionado = filtroNivel ? filtroNivel.value : "todos";
    const linhas = obterLinhas();
    let quantidadeVisivel = 0;

    linhas.forEach((linha) => {
      const textoAlerta = linha.textContent.toLocaleLowerCase("pt-BR");
      const correspondeTexto = textoAlerta.includes(termo);

      const correspondeNivel =
        nivelSelecionado === "todos" ||
        linha.dataset.nivel === nivelSelecionado;

      const visivel = correspondeTexto && correspondeNivel;

      linha.classList.toggle("oculto", !visivel);
      linha.setAttribute("aria-hidden", String(!visivel));

      if (visivel) quantidadeVisivel++;
    });

    mensagemVazia.hidden = quantidadeVisivel > 0;
    atualizarResumo();
  }

  linhasIniciais.forEach((linha, indice) => {
    const id = linha.dataset.alertaId || `alerta-${indice + 1}`;

    linha.dataset.alertaId = id;
    linha.dataset.nivelOriginal = linha.dataset.nivel || "critico";

    if (alertasRemovidos.has(id)) {
      linha.remove();
      return;
    }
    const sensorExistente =
      linha.querySelector(".sensor strong")?.textContent.trim() || "";

    const descricaoSensor =
      linha.querySelector(".sensor p")?.textContent.trim() || "";

    aplicarSensor(
      linha,
      sensorExistente
        ? `${sensorExistente} — ${descricaoSensor || "Sensor de origem"}`
        : "Sensor não identificado",
    );

    const alteracao = alteracoesSalvas[id];

    if (alteracao) {
      linha.querySelector(".mensagem strong").textContent =
        alteracao.titulo || "";
      linha.querySelector(".mensagem p").textContent =
        alteracao.descricao || "";
      linha.querySelector(".valor strong").textContent = alteracao.valor || "";
      linha.querySelector(".valor p").textContent =
        `Limite: ${alteracao.limite || "—"}`;

      aplicarSensor(linha, alteracao.sensor || "Sensor não identificado");

      linha.querySelector(".hora").textContent =
        alteracao.hora || linha.querySelector(".hora").textContent;

      aplicarNivel(linha, alteracao.nivel || linha.dataset.nivel);

      linha.dataset.nivelOriginal =
        alteracao.nivelOriginal || linha.dataset.nivelOriginal;
    } else if (niveisAntigos[id]) {
      aplicarNivel(linha, niveisAntigos[id]);
    }

    criarMenuAcoes(linha);
  });

  const mensagemVazia = document.createElement("p");
  mensagemVazia.className = "nenhum-alerta";
  mensagemVazia.textContent = "Nenhum alerta encontrado.";
  mensagemVazia.hidden = true;
  listaAlertas.appendChild(mensagemVazia);

  function salvarEstado() {
    const alteracoes = {};
    const niveis = {};

    obterLinhas().forEach((linha) => {
      const id = linha.dataset.alertaId;
      const nivel = linha.dataset.nivel;

      niveis[id] = nivel;

      alteracoes[id] = {
        titulo:
          linha.querySelector(".mensagem strong")?.textContent.trim() || "",
        descricao: linha.querySelector(".mensagem p")?.textContent.trim() || "",
        nivel,
        nivelOriginal: linha.dataset.nivelOriginal || "critico",
        sensor:
          `${linha.querySelector(".sensor strong")?.textContent.trim() || ""} — ${linha.querySelector(".sensor p")?.textContent.trim() || ""}`.trim(),
        valor: linha.querySelector(".valor strong")?.textContent.trim() || "",
        limite: (linha.querySelector(".valor p")?.textContent || "")
          .replace(/^Limite\s*:\s*/i, "")
          .trim(),
        hora: linha.querySelector(".hora")?.textContent.trim() || "",
      };
    });

    try {
      localStorage.setItem(
        chaveArmazenamento,
        JSON.stringify({
          alteracoes,
          niveis,
          removidos: Array.from(alertasRemovidos),
        }),
      );
    } catch (erro) {
      console.error("Não foi possível salvar as alterações dos alertas:", erro);
      mostrarAviso("Não foi possível salvar as alterações neste navegador.");
    }
  }

  listaAlertas.addEventListener("click", (evento) => {
    const botaoMenu = evento.target.closest(".btn-menu");

    if (botaoMenu) {
      const linha = botaoMenu.closest(".linha-alerta");
      const menu = linha.querySelector(".menu-alerta-acoes");
      const estavaAberto = menu && !menu.hidden;

      fecharMenus();

      if (menu && !estavaAberto) {
        menu.hidden = false;
        botaoMenu.setAttribute("aria-expanded", "true");
      }

      return;
    }

    const botaoAcao = evento.target.closest("[data-acao]");

    if (!botaoAcao) return;

    const linha = botaoAcao.closest(".linha-alerta");

    if (!linha) return;

    const acao = botaoAcao.dataset.acao;
    const titulo =
      linha.querySelector(".mensagem strong")?.textContent.trim() || "Alerta";

    if (acao === "editar") {
      abrirModal(linha);
      return;
    }

    if (acao === "resolver") {
      aplicarNivel(linha, "normal");
      atualizarBotoesMenu(linha);
      fecharMenus();
      salvarEstado();
      filtrarAlertas();
      mostrarAviso(`${titulo}: marcado como resolvido.`);
    }

    if (acao === "reabrir") {
      aplicarNivel(linha, linha.dataset.nivelOriginal || "critico");
      atualizarBotoesMenu(linha);
      fecharMenus();
      salvarEstado();
      filtrarAlertas();
      mostrarAviso(`${titulo}: alerta reaberto.`);
    }

    if (acao === "excluir") {
      alertasRemovidos.add(linha.dataset.alertaId);
      linha.remove();
      fecharMenus();
      salvarEstado();
      filtrarAlertas();
      mostrarAviso("Alerta excluído.");
    }
  });

  if (btnExcluirTodos) {
    btnExcluirTodos.addEventListener("click", () => {
      const linhas = obterLinhas();

      if (linhas.length === 0) {
        mostrarAviso("Não há alertas para excluir.");
        return;
      }

      const confirmou = window.confirm(
        "Deseja realmente excluir todos os alertas?",
      );

      if (!confirmou) return;

      linhas.forEach((linha) => {
        alertasRemovidos.add(linha.dataset.alertaId);
        linha.remove();
      });

      fecharMenus();
      salvarEstado();
      filtrarAlertas();
      mostrarAviso("Todos os alertas foram excluídos.");
    });
  }

  formEdicao.addEventListener("submit", salvarEdicao);

  modal
    .querySelector(".fechar-modal-alerta")
    .addEventListener("click", fecharModal);
  modal
    .querySelector(".btn-cancelar-modal")
    .addEventListener("click", fecharModal);

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) fecharModal();
  });

  if (campoBusca) campoBusca.addEventListener("input", filtrarAlertas);
  if (filtroNivel) filtroNivel.addEventListener("change", filtrarAlertas);

  document.addEventListener("click", (evento) => {
    if (
      !evento.target.closest(".btn-menu") &&
      !evento.target.closest(".menu-alerta-acoes")
    ) {
      fecharMenus();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      fecharMenus();
      fecharModal();
    }
  });

  salvarEstado();
  filtrarAlertas();
});
