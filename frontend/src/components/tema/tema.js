(() => {
  const CHAVE_TEMA = "pulseMineTemaVisual";
  const TEMA_PADRAO = "escuro";

  function obterTemaSalvo() {
    try {
      const tema = localStorage.getItem(CHAVE_TEMA);

      if (tema === "claro" || tema === "escuro") {
        return tema;
      }
    } catch (erro) {
      console.warn("Não foi possível recuperar o tema salvo.", erro);
    }

    return TEMA_PADRAO;
  }

  function atualizarControles() {
    const temaAtual = document.documentElement.dataset.tema;

    document.querySelectorAll('input[name="temaVisual"]').forEach((campo) => {
      campo.checked = campo.value === temaAtual;
    });

    document.querySelectorAll("[data-tema-atual]").forEach((elemento) => {
      elemento.textContent = temaAtual === "escuro" ? "Escuro" : "Claro";
    });
  }

  function aplicarTema(novoTema, salvar = true) {
    if (!["claro", "escuro"].includes(novoTema)) {
      return;
    }

    document.documentElement.dataset.tema = novoTema;

    document.documentElement.style.colorScheme =
      novoTema === "escuro" ? "dark" : "light";

    if (salvar) {
      try {
        localStorage.setItem(CHAVE_TEMA, novoTema);
      } catch (erro) {
        console.warn("Não foi possível salvar a preferência de tema.", erro);
      }
    }

    atualizarControles();
  }

  aplicarTema(obterTemaSalvo(), false);

  window.PulseMineTema = {
    definir(novoTema) {
      aplicarTema(novoTema);
    },

    obter() {
      return document.documentElement.dataset.tema;
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    atualizarControles();

    document.querySelectorAll('input[name="temaVisual"]').forEach((campo) => {
      campo.addEventListener("change", () => {
        if (campo.checked) {
          window.PulseMineTema.definir(campo.value);
        }
      });
    });
  });
})();
