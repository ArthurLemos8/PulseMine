
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
            console.log(`Status Normal. Sensor ${leitura.id_sensor_fk}: Vibracaoo em ${vibracao}`);
        }
    }

    _enviarAlertaCritico(idSensor, valor) {
        console.log(`\n Aleerta critico`);
        console.log(`O Sensor ${idSensor} atingiu um nivel critico de vibracao`);
        console.log(`O valor detectado de ${valor} excedeu o limite maximo de ${this.LIMITE_CRITICO}!`);
    }
}

export const alertaService = new AlertaService();