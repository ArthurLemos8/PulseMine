(() => {
  const api = window.PulseMineAPI;

  if (!api) {
    console.error(
      "PulseMineAPI não foi carregada. Verifique o arquivo api.js.",
    );
    return;
  }

  window.PulseMineDashboardService = {
    async obterLeituras() {
      const resposta = await api.get("/leituras-sensores");

      if (resposta?.success === false) {
        throw new Error(
          resposta.message || "Não foi possível buscar as leituras.",
        );
      }

      if (Array.isArray(resposta)) {
        return resposta;
      }

      if (Array.isArray(resposta?.data)) {
        return resposta.data;
      }

      throw new Error("O servidor retornou um formato de leituras inválido.");
    },

    async obterUltimaLeitura() {
      const resposta = await api.get("/leituras-sensores/ultima");

      if (resposta?.success === false) {
        throw new Error(
          resposta.message || "Não foi possível buscar a última leitura.",
        );
      }

      return resposta?.data || resposta;
    },
  };
})();
