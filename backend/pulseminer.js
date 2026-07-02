import express from 'express';
import 'dotenv/config'; 
import { leitorLinhas } from './config/serial.js';
import { alertaService } from './services/alerta.service.js';
import { salvarLeituraSensor } from './models/leitura-sensor.model.js';
import rotasLeituraSensor from './routes/leitura-sensor.route.js';

const app = express(); 

app.use(express.json());
app.use(rotasLeituraSensor);

leitorLinhas.on("data", async (dadosBrutos) => {
    try {
        const textoLimpo = dadosBrutos.toString().replace(/[\r\n]/g, "").trim();

        if (!textoLimpo || textoLimpo.includes('"status":"pronto"')) return;

        console.log("Recebido da Serial (Bruto):", textoLimpo);

        const leitura = JSON.parse(textoLimpo);

        if (leitura.erro) {
            console.log("Aviso do Sensor:", leitura.erro);
            return;
        }

        alertaService.analisarLeitura(leitura);

        if ('valor_vibracao' in leitura && 'id_sensor_fk' in leitura) {
            const v_vibracao = parseFloat(leitura.valor_vibracao);
            const id_sensor = parseInt(leitura.id_sensor_fk);

            if (!isNaN(v_vibracao) && !isNaN(id_sensor)) {
                const dadosParaSalvar = {
                    dispositivo: leitura.dispositivo || "Arduino Uno",
                    numero_leitura: leitura.numero_leitura || 0,
                    valor_vibracao: v_vibracao,
                    id_sensor_fk: id_sensor
                };

                const registro = await salvarLeituraSensor(dadosParaSalvar);
                console.log("-> Salvo com sucesso no MySQL, ID:", registro.id || registro.insertId);
            }
        }
    } catch (erro) {
        console.error("Erro no processamento da leitura serial:", erro.message);
    }
});

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
    console.log(`Servidor executando em http://localhost:${PORTA}`);
});