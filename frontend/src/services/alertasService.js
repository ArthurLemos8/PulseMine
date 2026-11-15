(() => {
  const api = window.PulseMineAPI;
  const endpoint = "/alertas";

  if (!api) {
    console.error("PulseMineAPI não foi carregada.");
    return;
  }

  window.PulseMineAlertasService = {
    listar() {
      return api.get(endpoint);
    },

    buscarPorId(id) {
      if (!id) throw new Error("ID do alerta não informado.");

      return api.get(`${endpoint}/${encodeURIComponent(id)}`);
    },

    criar(dados) {
      if (!dados) throw new Error("Dados do alerta não informados.");

      return api.post(endpoint, dados);
    },

    atualizar(id, dados) {
      if (!id) throw new Error("ID do alerta não informado.");
      if (!dados) throw new Error("Dados do alerta não informados.");

      return api.put(`${endpoint}/${encodeURIComponent(id)}`, dados);
    },

    atualizarStatus(id, status) {
      if (!id) throw new Error("ID do alerta não informado.");
      if (!status) throw new Error("Status não informado.");

      return api.patch(`${endpoint}/${encodeURIComponent(id)}`, { status });
    },

    excluir(id) {
      if (!id) throw new Error("ID do alerta não informado.");

      return api.delete(`${endpoint}/${encodeURIComponent(id)}`);
    },
  };
})();
