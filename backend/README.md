import express from 'express';
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { PrismaClient } from '@prisma/client';
import 'dotenv/config'; 

const app = express();               
const prisma = new PrismaClient();   
var ultimoDadoSalvo = null;          

const conexaoSerial = new SerialPort({
    path: "COM6",       
    baudRate: 9600      
});

const leitorLinhas = conexaoSerial.pipe(
    new ReadlineParser({ delimiter: "\n" })
);

leitorLinhas.on("data", async (dadosBrutos) => {
    try {
       
        const leitura = JSON.parse(dadosBrutos.toString().trim());

        if (leitura.erro) {
            console.log("Aviso do Sensor:", leitura.erro);
            return;
        }

        ultimoDadoSalvo = leitura;
        console.log("Recebido do Arduino:", ultimoDadoSalvo);
        
        if (leitura.valor_vibracao && leitura.id_sensor_fk) {
            const registro = await prisma.leituraVibracao.create({
                data: {
                    valor_vibracao: parseFloat(leitura.valor_vibracao),
                    id_sensor_fk: parseInt(leitura.id_sensor_fk)
                }
            });
            console.log("Salvo no banco de dados, id=", registro.id_leitura);
        }

    } catch (erroParse) {
        
        console.log("Texto ignorado (Não é um dado do sensor):", dadosBrutos.toString().trim());
    }
});

app.get('/', (req, resposta) => {
    resposta.json({ status: "API Online e escutando o Arduino" });
});

app.get("/sensor", (req, resposta) => {
    if (!ultimoDadoSalvo) {
        return resposta.status(404).json({ status: "Aguardando primeira leitura" });
    }
    resposta.json(ultimoDadoSalvo);
});

app.get("/historico", async (req, resposta) => {
    try {
        const registros = await prisma.leituraVibracao.findMany({
            take: 20, 
            orderBy: { id_leitura: 'desc' } 
        });
        resposta.json(registros);
    } catch (erroBanco) {
        resposta.status(500).json({ erro: "Falha ao consultar histórico no banco de dados" });
    }
});

app.listen(3000, () => {
    console.log("Servidor executando em http://localhost:3000");
});
