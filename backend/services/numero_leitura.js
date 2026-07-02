import { salvarLeituraSensor } from '../models/leitura-sensor.model.js';
import { alertaService } from './alerta.service.js';

let numero_leitura = 0;

export const leituraService = {
    async processarDadosSerial(dadosBrutos) {
        const texto = dadosBrutos.toString().trim();

        if (texto.includes('inicializando') || texto.includes('pronto')) {
            numero_leitura = 0;
            console.log("\n🔄 Contador resetado para 0.\n");
            return numero_leitura;
        }

        numero_leitura++;
        
        console.log(`Número da Leitura Atual: ${numero_leitura}`);
        return numero_leitura;
    }
};