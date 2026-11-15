(() => {
  const api = window.PulseMineAPI;

  if (!api) {
    console.error("PulseMineAPI não foi carregada.");
    return;
  }

  window.PulseMineSensoresService = {
    listar() {
      return api.get("/sensores");
    },

    buscarPorId(id) {
      if (!id) throw new Error("ID do sensor não informado.");

      return api.get(`/sensores/${encodeURIComponent(id)}`);
    },

    criar(dados) {
      if (!dados) throw new Error("Dados do sensor não informados.");

      return api.post("/sensores", dados);
    },

    atualizar(id, dados) {
      if (!id) throw new Error("ID do sensor não informado.");
      if (!dados) throw new Error("Dados do sensor não informados.");

      return api.put(`/sensores/${encodeURIComponent(id)}`, dados);
    },

    excluir(id) {
      if (!id) throw new Error("ID do sensor não informado.");

      return api.delete(`/sensores/${encodeURIComponent(id)}`);
    },
  };
})();
