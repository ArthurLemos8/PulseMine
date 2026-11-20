import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const portaArduino = process.env.PORTA_ARDUINO || "COM3";

export const conexaoSerial = new SerialPort({
    path: portaArduino,
    baudRate: 9600,
    autoOpen: false
});

export const leitorLinhas = conexaoSerial.pipe(
    new ReadlineParser({ delimiter: "\n" })
);

conexaoSerial.on("error", (erro) => {
    console.error("Erro na conexão com Arduino:", erro.message);
});

if (process.env.USAR_ARDUINO === "true") {
    conexaoSerial.open((erro) => {
        if (erro) {
            console.error("Arduino indisponível:", erro.message);
            return;
        }

        console.log("Arduino conectado na porta", portaArduino);
    });
} else {
    console.log("Modo sem Arduino: comunicação serial desativada.");
}