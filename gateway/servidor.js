import express from 'express';

// Criar um obj de expresss
const app = express();
const porta = 3000;

// Preparar o ambiente para trabalhar com JSON
app.use(express.json());

// Contruir a rota para os dados via json
app.post('/api/leituras-sensores',(requisicao,resposta) => {
    // Capturar o json
    const dadosSensor = requisicao.body;

    // Mostra para o usuário  uma msg
    console.log('Dados recebidos no backend:', dadosSensor);

    // Retornar sucesso ou erro
    resposta.status(201).json({
        menagem: 'Leitura recebida com sucesso',
        dados: dadosSensor
    });

}

);


// Ouvir a porta serial para capturar os dados
app.listen(porta, () => {
   console.log(`Backend executando em http://localhost:${porta}`);
});





