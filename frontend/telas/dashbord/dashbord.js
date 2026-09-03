function atualizarDataHora() {
  const agora = new Date();

  const dia = String(agora.getDate()).padStart(2, "0");
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const ano = agora.getFullYear();

  const data = `${dia}/${mes}/${ano}`;

  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  const segundos = String(agora.getSeconds()).padStart(2, "0");

  const hora = `${horas}:${minutos}:${segundos}`;

  document.getElementById("dataAtual").textContent = data;
  document.getElementById("horaAtual").textContent = hora;
}

atualizarDataHora();

setInterval(atualizarDataHora, 1000);
