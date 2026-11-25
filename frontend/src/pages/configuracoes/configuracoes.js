document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  let timeoutToast;
  let sensoresDisponiveis = [];

  function mensagem(texto) {
    const toast = $("toast");

    if (!toast) return;

    toast.textContent = texto;
    toast.hidden = false;

    clearTimeout(timeoutToast);

    timeoutToast = setTimeout(() => {
      toast.hidden = true;
    }, 3200);
  }

  function erro(id, texto) {
    const campo = $(id);

    if (!campo) return;

    campo.textContent = texto;
    campo.hidden = !texto;
  }

  const linksIndice = document.querySelectorAll(".indice a");
  const secoes = document.querySelectorAll(".paineis .painel");

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

  const formConfiguracoes = $("formConfiguracoes");

  formConfiguracoes?.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const atencao = Number($("limiteAtencao").value);
    const critico = Number($("limiteCritico").value);

    if (
      !Number.isFinite(atencao) ||
      !Number.isFinite(critico) ||
      atencao < 0.1 ||
      critico > 100 ||
      critico <= atencao
    ) {
      erro(
        "erroConfiguracao",
        "Informe limites válidos. O limite crítico deve ser maior que o de atenção.",
      );

      return;
    }

    erro(
      "erroConfiguracao",
      "O backend atual ainda não possui uma rota para salvar os limites.",
    );
  });

  const selectSensor = $("sensorSelecionado");

  const nomeSensor = $("sensorNome");
  const localSensor = $("sensorLocal");
  const statusSensor = $("sensorStatus");

  function limparSensor() {
    if (selectSensor) {
      selectSensor.value = "";
    }

    if (nomeSensor) nomeSensor.value = "";
    if (localSensor) localSensor.value = "";
    if (statusSensor) statusSensor.value = "ativo";

    erro("erroSensor", "");
  }

  async function carregarSensores() {
    if (!selectSensor) return;

    try {
      sensoresDisponiveis = await window.PulseMineSensoresService.listar();

      selectSensor.replaceChildren();

      const opcaoInicial = document.createElement("option");

      opcaoInicial.value = "";
      opcaoInicial.textContent = "Novo sensor";

      selectSensor.appendChild(opcaoInicial);

      sensoresDisponiveis.forEach((sensor) => {
        const opcao = document.createElement("option");

        opcao.value = sensor.id;
        opcao.textContent = `${sensor.nome} (ID ${sensor.id})`;

        selectSensor.appendChild(opcao);
      });

      if (sensoresDisponiveis.length === 0) {
        erro(
          "erroSensor",
          "Nenhum sensor foi identificado nas leituras recebidas.",
        );
      } else {
        erro(
          "erroSensor",
          "Sensores identificados nas leituras do banco de dados.",
        );
      }
    } catch (erroApi) {
      erro(
        "erroSensor",
        `Não foi possível carregar os sensores: ${erroApi.message}`,
      );
    }
  }

  selectSensor?.addEventListener("change", () => {
    const sensor = sensoresDisponiveis.find(
      (item) => String(item.id) === String(selectSensor.value),
    );

    if (!sensor) {
      limparSensor();
      return;
    }

    nomeSensor.value = sensor.nome;
    localSensor.value = sensor.localizacao;
    statusSensor.value = sensor.status;

    erro(
      "erroSensor",
      "Este sensor foi identificado nas leituras. A edição ainda não está disponível no backend.",
    );
  });

  $("btnNovoSensor")?.addEventListener("click", limparSensor);

  $("formSensor")?.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const dados = {
      nome: nomeSensor.value.trim(),
      localizacao: localSensor.value.trim(),
      status: statusSensor.value,
    };

    if (
      !dados.nome ||
      !dados.localizacao ||
      !["ativo", "inativo"].includes(dados.status)
    ) {
      erro("erroSensor", "Preencha os dados do sensor corretamente.");
      return;
    }

    try {
      if (selectSensor.value) {
        await window.PulseMineSensoresService.atualizar(
          selectSensor.value,
          dados,
        );
      } else {
        await window.PulseMineSensoresService.criar(dados);
      }

      mensagem("Sensor atualizado.");
      await carregarSensores();
    } catch (erroApi) {
      erro("erroSensor", erroApi.message);
    }
  });

  carregarSensores();
});
