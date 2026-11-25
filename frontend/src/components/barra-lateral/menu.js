(async function iniciarMenu() {
  const destino = document.getElementById("menu-container");

  if (!destino) return;

  try {
    const resposta = await fetch("../../components/barra-lateral/menu.html");

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    destino.outerHTML = await resposta.text();

    const barra = document.querySelector(".barra_lateral");
    const painel = document.querySelector(".dashboard");
    const botao = document.getElementById("btnRecolher");

    if (!barra || !painel || !botao) return;

    const btnSair = barra.querySelector(".sair");

    if (btnSair) {
      btnSair.addEventListener("click", (evento) => {
        evento.preventDefault();

        btnSair.dataset.logoutHandled = "true";

        sessionStorage.removeItem("pulseMineToken");
        sessionStorage.removeItem("pulseMineEmail");

        window.location.href = btnSair.href;
      });
    }

    const pagina = document.body.dataset.pagina;
    const ativo = barra.querySelector(`[data-pagina="${pagina}"]`);

    if (ativo) {
      ativo.classList.add("ativo");
      ativo.setAttribute("aria-current", "page");
    }

    const mobile = () => window.matchMedia("(max-width: 760px)").matches;

    let preferencia = false;

    function atualizar() {
      const recolhido = mobile() || preferencia;

      barra.classList.toggle("recolhida", recolhido);
      painel.classList.toggle("menu-recolhido", recolhido);

      botao.disabled = mobile();
      botao.setAttribute("aria-expanded", String(!recolhido));

      const rotulo = recolhido
        ? "Expandir menu lateral"
        : "Recolher menu lateral";

      botao.setAttribute("aria-label", rotulo);
      botao.title = rotulo;

      botao.querySelector("i").className = recolhido
        ? "fa-solid fa-angles-right"
        : "fa-solid fa-angles-left";

      botao.querySelector("span").textContent = recolhido
        ? "Expandir"
        : "Recolher";
    }

    botao.addEventListener("click", () => {
      preferencia = !preferencia;
      atualizar();
    });

    window.addEventListener("resize", atualizar);

    atualizar();
  } catch (erro) {
    destino.innerHTML =
      '<p style="padding:16px;color:#b91c1c">Não foi possível carregar o menu.</p>';

    console.error("Erro ao carregar menu:", erro);
  }
})();
