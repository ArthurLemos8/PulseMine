import { conexaoBancoDados } from '../config/banco-dados.js';

export class AlertaService {
    constructor() {
        this.LIMITE_CRITICO = 1.5; 
    }
    async analisarLeitura(leitura) {
        const vibracao = parseFloat(leitura.valor_vibracao);

        if (isNaN(vibracao)) return;

        if (vibracao >= this.LIMITE_CRITICO) {
            await this._enviarAlertaCritico(leitura.id, vibracao, leitura.id_sensor_fk);
        } else {
            console.log(`Status Normal. Sensor ${leitura.id_sensor_fk}: Vibracaoo em ${vibracao}`);
        }
    }
    async _enviarAlertaCritico(idLeitura, valor, idSensor) {
        console.log(`\n Aleerta critico`);
        console.log(`O Sensor ${idSensor} atingiu um nivel critico de vibracao`);
        console.log(`O valor detectado de ${valor} excedeu o limite maximo de ${this.LIMITE_CRITICO}!`);

        const sql = `INSERT INTO alerta (tipo_alerta, mensagem, status_resolucao, id_leitura_fk) VALUES (?, ?, ?, ?)`;
        await conexaoBancoDados.execute(sql, ['Crítico', `Vibração em ${valor}`, 'Pendente', idLeitura]);
    }
}
export const alertaService = new AlertaService();