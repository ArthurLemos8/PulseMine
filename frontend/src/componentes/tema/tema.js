// Tema compartilhado do PulseMine.
(() => {
  const CHAVE = "pulseMineTema";
  let salvo = null;
  try { salvo = localStorage.getItem(CHAVE); } catch (_) {}
  const tema = salvo === "claro" ? "claro" : "escuro";
  document.documentElement.dataset.tema = tema;
  document.documentElement.style.colorScheme = tema === "escuro" ? "dark" : "light";
  function atualizarControles() {
    const atual = document.documentElement.dataset.tema;
    document.querySelectorAll('input[name="temaVisual"]').forEach(el => { el.checked = el.value === atual; });
    document.querySelectorAll('[data-tema-atual]').forEach(el => { el.textContent = atual === "escuro" ? "Escuro" : "Claro"; });
  }
  window.PulseMineTema = {
    definir(novoTema) {
      if (novoTema !== "claro" && novoTema !== "escuro") return;
      document.documentElement.dataset.tema = novoTema;
      document.documentElement.style.colorScheme = novoTema === "escuro" ? "dark" : "light";
      try { localStorage.setItem(CHAVE, novoTema); } catch (_) {}
      atualizarControles();
    }
  };
  document.addEventListener("DOMContentLoaded", () => {
    atualizarControles();
    document.querySelectorAll('input[name="temaVisual"]').forEach(el => {
      el.addEventListener("change", () => { if (el.checked) window.PulseMineTema.definir(el.value); });
    });
  });
})();
