document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  let timeoutToast;
  let sensores = [];

  function mensagem(texto) {
    const toast = $("toast");

    toast.textContent = texto;
    toast.hidden = false;

    clearTimeout(timeoutToast);

    timeoutToast = setTimeout(() => {
      toast.hidden = true;
    }, 3200);
  }

  function erro(id, texto) {
    $(id).textContent = texto;
    $(id).hidden = !texto;
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
      const idSecao = link.getAttribute("href").substring(1);

      atualizarIndice(idSecao);
    });
  });

  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visiveis = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visiveis.length > 0) {
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

  try {
    const config = JSON.parse(
      localStorage.getItem("pulseMineConfiguracoes") || "{}",
    );

    if (
      Number(config.limiteAtencao) > 0 &&
      Number(config.limiteCritico) > Number(config.limiteAtencao)
    ) {
      $("limiteAtencao").value = config.limiteAtencao;
      $("limiteCritico").value = config.limiteCritico;
    }
  } catch {}

  $("formConfiguracoes").addEventListener("submit", (evento) => {
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
        "Informe limites válidos; o crítico deve ser maior que o de atenção.",
      );

      return;
    }

    try {
      localStorage.setItem(
        "pulseMineConfiguracoes",
        JSON.stringify({
          limiteAtencao: atencao,
          limiteCritico: critico,
        }),
      );

      erro("erroConfiguracao", "");

      mensagem("Limites salvos. O Dashboard os carregará ao abrir.");
    } catch {
      erro("erroConfiguracao", "Não foi possível salvar neste navegador.");
    }
  });

  try {
    const dados = JSON.parse(localStorage.getItem("pulseMineSensores") || "[]");

    sensores = Array.isArray(dados) ? dados : [];
  } catch {
    sensores = [];
  }

  function renderizarSensores(id = "") {
    const select = $("sensorSelecionado");

    select.replaceChildren();

    const novo = document.createElement("option");

    novo.value = "";
    novo.textContent = "Novo sensor";

    select.appendChild(novo);

    sensores.forEach((sensor) => {
      const option = document.createElement("option");

      option.value = sensor.id;
      option.textContent = sensor.nome;

      select.appendChild(option);
    });

    select.value = id;
  }

  function limparSensor() {
    $("sensorSelecionado").value = "";
    $("sensorNome").value = "";
    $("sensorLocal").value = "";
    $("sensorStatus").value = "ativo";

    erro("erroSensor", "");
  }

  $("btnNovoSensor").addEventListener("click", limparSensor);

  $("sensorSelecionado").addEventListener("change", () => {
    const sensor = sensores.find((s) => s.id === $("sensorSelecionado").value);

    if (!sensor) {
      limparSensor();
      return;
    }

    $("sensorNome").value = sensor.nome;
    $("sensorLocal").value = sensor.localizacao;
    $("sensorStatus").value = sensor.status;

    erro("erroSensor", "");
  });

  $("formSensor").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const id = $("sensorSelecionado").value;
    const nome = $("sensorNome").value.trim();
    const localizacao = $("sensorLocal").value.trim();
    const status = $("sensorStatus").value;

    if (!nome || !localizacao || !["ativo", "inativo"].includes(status)) {
      erro("erroSensor", "Preencha os dados do sensor.");
      return;
    }

    const anteriores = sensores.map((s) => ({ ...s }));

    let salvoId = id;

    const indice = sensores.findIndex((s) => s.id === id);

    if (indice !== -1) {
      sensores[indice] = {
        ...sensores[indice],
        nome,
        localizacao,
        status,
      };
    } else {
      salvoId = `sensor-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      sensores.push({
        id: salvoId,
        nome,
        localizacao,
        status,
      });
    }

    try {
      localStorage.setItem("pulseMineSensores", JSON.stringify(sensores));

      renderizarSensores(salvoId);

      erro("erroSensor", "");

      mensagem("Sensor salvo neste navegador.");
    } catch {
      sensores = anteriores;

      erro("erroSensor", "Não foi possível salvar neste navegador.");
    }
  });

  renderizarSensores();
});
