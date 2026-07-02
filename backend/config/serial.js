import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

export const conexaoSerial = new SerialPort({
    path: "COM6",
    baudRate: 9600
});

export const leitorLinhas = conexaoSerial.pipe(
    new ReadlineParser({ delimiter: "\n" })
);