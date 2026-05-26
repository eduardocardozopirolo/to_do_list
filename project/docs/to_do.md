## ETAPA 1 — Planejamento
- Escolher tema (ex: Tasks / Tarefas) -- V
- Definir entidade principal (ex: tasks) -- V
- Definir campos da tabela: -- V
- id -- V
- title -- V
- description -- V
- status (pendente/concluído) -- V
- created_at -- V
## ETAPA 2 — Backend (API CRUD)
- Criar projeto (Node.js ou Flask) -- V
- Criar estrutura de pastas -- V
- Criar conexão com banco -- V
- Criar rotas:
- GET /tasks -- V
- POST /tasks -- V
- PUT /tasks/{id} -- V
- DELETE /tasks/{id} -- V
- Testar API local (Postman ou navegador) -- V
## ETAPA 3 — Banco de Dados (Amazon RDS)
- Criar instância RDS -- V
- Configurar: -- V
- subnet privada -- V
- sem acesso público -- V
- Criar banco (MySQL/Postgres) -- V
- Criar tabela tasks -- V
- Inserir dados de teste -- V
- Conectar API ao RDS -- V
## ETAPA 4 — Docker
- Criar Dockerfile -- V
- Build da imagem -- V
- Rodar container local -- V
- Testar API dentro do container -- V
## ETAPA 5 — Deploy Backend
Escolher:
- Amazon ECS ou EC2 + Docker -- V
- Subir container na AWS -- V
- Garantir que backend responde -- V
## ETAPA 6 — Amazon API Gateway
- Criar API Gateway -- V
- Criar rotas: -- V
- GET /tasks -- V
- POST /tasks -- V
- PUT /tasks/{id} -- V
- DELETE /tasks/{id} -- V
- Integrar com backend -- V
- Testar via API Gateway -- V
## ETAPA 7 — AWS Lambda (/report)
- Criar função Lambda
- Fazer chamada HTTP para API
- Calcular estatísticas:
- total de tasks
- tasks concluídas
- Retornar JSON
- Criar rota /report no API Gateway
- Testar funcionando
## ETAPA 8 — Front-end
- Criar interface simples (HTML/React)
- Criar tela de:
- listar tarefas
- criar tarefa
- editar tarefa
- deletar tarefa
- Consumir API Gateway (não backend direto!)
- Consumir /report
- Testar tudo funcionando
## ETAPA 9 — GitHub
- Criar repositório
- Subir código:
- backend
- frontend
- lambda
- dockerfile
- SQL
- Criar README com:
- descrição
- arquitetura
- endpoints
- como rodar
## ETAPA 10 — PDF
- Diagrama da arquitetura
- Prints:
- RDS
- API Gateway
- Lambda
- ECS/EC2
- Explicar o que cada parte faz
- Descrever participação do grupo
## ETAPA 11 — Vídeo
- Mostrar CRUD funcionando
- Mostrar /report funcionando
- Explicar arquitetura
- Narrar (IMPORTANTE)
## ETAPA 12 — Apresentação
- Demonstrar sistema ao vivo
- Explicar arquitetura
- Mostrar integração AWS
## ETAPA FINAL — Entrega
- ZIP com tudo
- Link do vídeo (não listado)
- README completo
- Código funcionando

O QUE É VPC????