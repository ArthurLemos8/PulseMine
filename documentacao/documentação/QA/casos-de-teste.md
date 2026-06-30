# Casos de Teste - PulseMine

**Projeto:** PulseMine – Sistema de Monitoramento de Vibração 

---
# CT01 - Recebimento de dados do Arduino

**Objetivo:**
Validar a comunicação entre Arduino e backend.

**Pré-condição:**
Arduino conectado e enviando dados.

**Passos:**
1. Iniciar o Arduino.
2. Observar a leitura dos dados.

**Resultado esperado:**
O backend recebe continuamente os valores dos eixos X, Y e Z enviados pelo sensor ADXL345.

**Status:** Aprovado

---

# CT02 - Consulta da última leitura

**Objetivo:**
Validar a rota de consulta da última leitura do sensor.

**Pré-condição:**
Pelo menos uma leitura recebida.

**Passos:**
1. Acessar:
   http://localhost:3000/sensor

**Resultado esperado:**
Retornar o último registro contendo os valores de X, Y e Z.

**Status:** Aprovado

---

# CT03 - Consulta do histórico

**Objetivo:**
Validar a recuperação do histórico de leituras.

**Pré-condição:**
Existirem registros armazenados no banco de dados.

**Passos:**
1. Acessar:
   http://localhost:3000/historico

**Resultado esperado:**
A API retorna a lista das leituras armazenadas.

**Status:** Aprovado

---

# CT04 - Tratamento de erro na consulta do histórico

**Objetivo:**
Validar o tratamento de erro durante a consulta ao banco.

**Pré-condição:**
Falha de conexão com o banco de dados.

**Passos:**
1. Simular indisponibilidade do banco.
2. Acessar:
   http://localhost:3000/historico

**Resultado esperado:**
A API retorna erro 500 com a mensagem:

{
  "erro": "Falha ao consultar histórico."
}

**Status:** Não executado

---

## Issues registradas durante o desenvolvimento

Durante a execução dos testes e revisão do projeto, foram registradas as seguintes issues no GitHub:

- Revisão e padronização das telas do sistema PulseMine;
- Implementação da estrutura de alertas no banco de dados;
- Criação da entidade Alerta na modelagem do banco;
- Correção do cálculo da vibração utilizando intervalo de tempo real.

As issues foram utilizadas para organizar melhorias e evoluções do projeto durante o desenvolvimento.
