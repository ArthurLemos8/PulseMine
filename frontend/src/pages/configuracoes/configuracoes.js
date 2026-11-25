document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  let timeoutToast;

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

  if (formConfiguracoes) {
    formConfiguracoes.addEventListener("submit", (evento) => {
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
        "O Back-end ainda não possui uma rota para salvar os limites. Nenhuma alteração foi gravada.",
      );
    });
  }

  const selectSensor = $("sensorSelecionado");

  function limparSensor() {
    if (selectSensor) selectSensor.value = "";

    $("sensorNome").value = "";
    $("sensorLocal").value = "";
    $("sensorStatus").value = "ativo";

    erro("erroSensor", "");
  }

  $("btnNovoSensor")?.addEventListener("click", limparSensor);

  selectSensor?.addEventListener("change", limparSensor);

  $("formSensor")?.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nome = $("sensorNome").value.trim();
    const localizacao = $("sensorLocal").value.trim();
    const status = $("sensorStatus").value;

    if (!nome || !localizacao || !["ativo", "inativo"].includes(status)) {
      erro("erroSensor", "Preencha os dados do sensor corretamente.");
      return;
    }

    erro(
      "erroSensor",
      "O Back-end ainda não possui rotas para cadastrar ou atualizar sensores. Nenhuma alteração foi gravada.",
    );
  });
});
