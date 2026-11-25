(() => {
  const temaInicial = "escuro";

  document.documentElement.dataset.tema = temaInicial;

  document.documentElement.style.colorScheme = "dark";

  function atualizarControles() {
    const atual = document.documentElement.dataset.tema;

    document.querySelectorAll('input[name="temaVisual"]').forEach((campo) => {
      campo.checked = campo.value === atual;
    });

    document.querySelectorAll("[data-tema-atual]").forEach((elemento) => {
      elemento.textContent = atual === "escuro" ? "Escuro" : "Claro";
    });
  }

  window.PulseMineTema = {
    definir(novoTema) {
      if (!["claro", "escuro"].includes(novoTema)) return;

      document.documentElement.dataset.tema = novoTema;

      document.documentElement.style.colorScheme =
        novoTema === "escuro" ? "dark" : "light";

      atualizarControles();
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
