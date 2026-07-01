# Relatório de Testes - PulseMine

## Projeto

**PulseMine**

## Objetivo

Realizar alguns testes nas funcionalidades desenvolvidas até o momento, verificar possíveis problemas e registrar sugestões de melhorias durante o desenvolvimento do projeto.

---

## Testes realizados

Durante o desenvolvimento foram realizados testes nos seguintes componentes:

- Comunicação entre Arduino e Backend;
- Dashboard;
- Tela de Alertas;
- Tela de Conta;
- Tela de Configuração;
- Modelagem lógica e conceitual do banco de dados.

---

## Observações

Como o Arduino permaneceu a maior parte do tempo com o integrante responsável pelo Backend, nem todos os testes puderam ser executados diretamente por mim.

Alguns testes relacionados à leitura do sensor ADXL345 e à comunicação com a API foram realizados e confirmados pelo integrante responsável pelo Backend, que informou que o funcionamento estava correto.

Já a parte de revisão das telas, modelagem do banco, codigos com possiveis erro e documentação foi acompanhada e revisada por mim durante o desenvolvimento.

---

## Revisão da modelagem do banco

Foi realizada uma conferência dos modelos conceitual e lógico.

Durante a revisão foi identificada a necessidade de incluir uma estrutura para armazenamento dos alertas do sistema, permitindo manter um histórico das ocorrências geradas pelo monitoramento de vibração.

Essa sugestão foi registrada no GitHub para análise da equipe.

---

## Revisão do código

Também foi realizada uma revisão do código do Arduino.

Durante essa análise foi sugerida uma melhoria no cálculo da vibração para utilizar o tempo real das leituras, tornando os valores mais próximos do comportamento esperado.

A sugestão também foi registrada como Issue no GitHub.

---

## Issues registradas durante a revisão

Durante a etapa de QA foram registradas algumas Issues no GitHub para documentar melhorias e possíveis correções identificadas durante o desenvolvimento.

Entre elas:

- Revisão e ajustes das telas do sistema PulseMine;
- Revisão da estrutura da tabela `leitura_vibracao` para suportar alertas;
- Criação da entidade de Alertas no modelo do banco de dados;
- Criação da estrutura para armazenamento de Alertas no banco de dados;
- Sugestão de melhoria no cálculo da vibração para obter valores mais precisos;
- Revisão do código do Arduino e do Gateway para identificação de possíveis erros.

As Issues registradas serviram para organizar as melhorias identificadas durante a revisão do projeto e facilitar o acompanhamento das tarefas pela equipe.

---

## Considerações finais

Os testes realizados até o momento indicam que as funcionalidades implementadas estão funcionando conforme esperado.

As revisões realizadas contribuíram para identificar oportunidades de melhoria na interface, na modelagem do banco de dados e no código do sistema.

Todas as observações relevantes foram registradas no GitHub por meio de Issues, auxiliando a equipe na organização e acompanhamento das atividades.
