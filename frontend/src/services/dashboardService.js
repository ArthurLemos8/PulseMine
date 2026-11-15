(() => {
  const api = window.PulseMineAPI;

  if (!api) {
    console.error("PulseMineAPI não foi carregada.");
    return;
  }

  window.PulseMineDashboardService = {
    obterResumo() {
      return api.get("/dashboard/resumo");
    },

    obterLeituras() {
      return api.get("/dashboard/leituras");
    },

    obterSensores() {
      return api.get("/sensores");
    },
  };
})();
