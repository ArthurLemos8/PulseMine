
export class AlertaService {
    constructor() {
        this.LIMITE_CRITICO = 1.5; 
    }

    analisarLeitura(leitura) {
        const vibracao = parseFloat(leitura.valor_vibracao);

        if (isNaN(vibracao)) return;

        if (vibracao >= this.LIMITE_CRITICO) {
            this._enviarAlertaCritico(leitura.id_sensor_fk, vibracao);
        } else {
            console.log(`Status Normal. Sensor ${leitura.id_sensor_fk}: Vibração em ${vibracao}`);
        }
    }

    _enviarAlertaCritico(idSensor, valor) {
        console.log(`\n⚠️ ALERTA CRÍTICO!!`);
        console.log(`O Sensor ${idSensor} atingiu um nível crítico de vibração!!`);
        console.log(`O valor detectado de ${valor} excedeu o limite máximo de ${this.LIMITE_CRITICO}!`);
    }
}

export const alertaService = new AlertaService();