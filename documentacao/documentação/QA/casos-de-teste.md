# Casos de Teste - PulseMine

## Projeto

**PulseMine – Sistema de Monitoramento de Vibração**

---

## CT01 - Comunicação entre Arduino e Backend

**Objetivo:**
Verificar se o Arduino envia corretamente os dados do sensor para o Backend.

**Pré-condição:**
Arduino conectado ao computador e sensor ADXL345 em funcionamento.

**Passos:**

1. Iniciar o Arduino.
2. Executar o Backend.
3. Verificar se os dados são recebidos pelo servidor.

**Resultado esperado:**
O Backend recebe continuamente os valores dos eixos X, Y e Z enviados pelo sensor.

**Status:** Aprovado (teste realizado pelo integrante responsável pelo Backend).

---

## CT02 - Consulta da API

**Objetivo:**
Verificar se a API retorna a última leitura recebida do sensor.

**Pré-condição:**
Backend em execução e recebendo dados do Arduino.

**Passos:**

1. Executar o Backend.
2. Acessar a rota `/sensor`.

**Resultado esperado:**
A API retorna o último registro contendo os valores dos eixos X, Y e Z.

**Status:** Aprovado.

---

## CT03 - Revisão da modelagem do banco de dados

**Objetivo:**
Verificar se a modelagem atende aos requisitos do sistema.

**Passos:**

1. Revisar o modelo conceitual.
2. Revisar o modelo lógico.
3. Comparar a estrutura do banco com as funcionalidades do sistema.

**Resultado esperado:**
Identificar possíveis melhorias ou entidades que ainda precisem ser implementadas.

**Status:** Concluído.

**Observação:**
Durante a revisão foi sugerida a criação de uma estrutura específica para armazenamento dos alertas do sistema.

---

## CT04 - Revisão das telas

**Objetivo:**
Verificar a padronização da interface do sistema.

**Passos:**

1. Revisar Login.
2. Revisar Cadastro.
3. Revisar Dashboard.
4. Revisar Alertas.
5. Revisar Conta.
6. Revisar Configuração.

**Resultado esperado:**
Todas as telas seguem o mesmo padrão visual, utilizando a identidade visual definida para o projeto.

**Status:** Concluído.

---

## CT05 - Revisão do código

**Objetivo:**
Realizar uma revisão do código do Arduino e do Backend em busca de possíveis melhorias.

**Passos:**

1. Analisar o código do Arduino.
2. Analisar a comunicação com o Backend.
3. Registrar possíveis melhorias encontradas.

**Resultado esperado:**
Registrar sugestões para melhorar a precisão da leitura dos dados e a organização do sistema.

**Status:** Concluído.

---

## Observações

Durante a etapa de QA também foram registradas Issues no GitHub relacionadas a melhorias identificadas durante o desenvolvimento, como:

- Revisão e ajustes das telas do sistema;
- Criação da estrutura de Alertas no banco de dados;
- Revisão da modelagem do banco de dados;
- Sugestão de melhoria no cálculo da vibração;
- Revisão do código do Arduino e do Gateway.

Esses registros foram utilizados para organizar e acompanhar as melhorias propostas para o projeto.
