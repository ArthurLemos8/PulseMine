import express from 'express';
import 'dotenv/config';
import { leitorLinhas } from './config/serial.js';
import { alertaService } from './services/alerta.service.js';
import { salvarLeituraSensor } from './models/leitura-sensor.model.js';
import { leituraService } from './services/numero_leitura.js';
import rotasLeituraSensor from './routes/leitura-sensor.route.js';

const app = express();

app.use(express.json());
app.use(rotasLeituraSensor);

leitorLinhas.on("data", async (dadosBrutos) => {
    try {
    
        const textoLimpo = dadosBrutos.toString().replace(/[\r\n]/g, "").trim();

        if (!textoLimpo || textoLimpo.includes('"status":"inicializando"') || textoLimpo.includes('"status":"pronto"')) {
            return;
        }

        console.log("Serial:", textoLimpo);

        const leitura = JSON.parse(textoLimpo);

        if (leitura.erro) {
            console.log("Erro vindo do sensor:", leitura.erro);
            return;
        }

        const moduloVetor = Math.sqrt(
            Math.pow(leitura.x, 2) + 
            Math.pow(leitura.y, 2) + 
            Math.pow(leitura.z, 2)
        );

        const dados = {
            dispositivo: "Planta Vibraçao Vale",
            numero_leitura: await leituraService.processarDadosSerial(dadosBrutos),
            valor_vibracao: (moduloVetor.toFixed(4)),
            id_sensor_fk: 1
        };

        alertaService.analisarLeitura(dados);

        const registro = await salvarLeituraSensor(dados);
        
        console.log("Leitura salva com sucesso:", registro);

    } catch (erro) {
        console.error("Erro no processamento da serial:", erro.message);
    }
});

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});