# Projeto To Do AWS

Sistema de gerenciamento de tarefas com API REST, banco PostgreSQL no Amazon RDS, backend em Docker na EC2, rota de relatorio com AWS Lambda/API Gateway e frontend em HTML, CSS e JavaScript.

## Objetivo

O projeto demonstra uma aplicacao CRUD completa usando servicos da AWS. A API permite criar, listar, atualizar e deletar tarefas. A funcao Lambda consulta a API de tarefas e gera um relatorio com total de tarefas, tarefas concluidas e tarefas pendentes.

## Arquitetura

```text
Usuario
  -> Frontend HTML/CSS/JS
  -> API Backend Node.js/Express na EC2
  -> Amazon RDS PostgreSQL

Usuario
  -> API Gateway GET /report
  -> AWS Lambda
  -> Backend GET /tasks
  -> Amazon RDS PostgreSQL
```

Componentes principais:

- **Frontend**: interface web estatica em HTML, CSS e JavaScript.
- **Backend**: API REST em Node.js com Express.
- **Banco de dados**: Amazon RDS PostgreSQL.
- **Docker**: empacota backend e frontend.
- **EC2**: hospeda containers Docker.
- **API Gateway**: expoe a rota `/report`.
- **Lambda**: gera estatisticas das tarefas.

## Estrutura de Pastas

```text
to_do_list_project
|-- README.md
|-- EXAMPLE.json
|-- ROUTES.txt
|-- to_do.md
|-- documentation
|   `-- documentacao.md
`-- project
    |-- backend
    |   |-- Dockerfile
    |   |-- docker-compose.yml
    |   |-- package.json
    |   `-- src
    |       |-- db.js
    |       |-- server.js
    |       `-- routes
    |           `-- task.js
    |-- database
    |   `-- DATABASE.sql
    |-- docs
    |   |-- API_GATEWAY.md
    |   |-- ARQUITETURE.txt
    |   `-- README.md
    |-- frontend
    |   |-- Dockerfile
    |   |-- index.html
    |   |-- nginx.conf
    |   |-- script.js
    |   |-- styles.css
    |   `-- README.md
    |-- infra
    |   `-- api-gateway.yml
    `-- lambda
        `-- report
            `-- index.mjs
```

## Entidade Principal

Tabela: `tasks`

Campos:

| Campo | Tipo | Descricao |
| --- | --- | --- |
| `id` | SERIAL | Identificador automatico |
| `title` | VARCHAR(255) | Titulo da tarefa |
| `description` | TEXT | Descricao da tarefa |
| `status` | VARCHAR(50) | Status da tarefa |
| `created_at` | TIMESTAMP | Data de criacao |

SQL:

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Arquivo:

```text
project/database/DATABASE.sql
```

## Backend

O backend fica em:

```text
project/backend
```

Tecnologias usadas:

- Node.js
- Express
- PostgreSQL com biblioteca `pg`
- dotenv
- cors
- Docker

Arquivos principais:

- `src/server.js`: inicializa a API Express.
- `src/db.js`: cria a conexao com PostgreSQL.
- `src/routes/task.js`: implementa as rotas CRUD.

## Variaveis de Ambiente do Backend

O backend usa variaveis de ambiente para conectar no PostgreSQL:

```env
PORT=3000
DB_USER=postgres
DB_HOST=tododb.cozyt5tthfmg.us-east-1.rds.amazonaws.com
DB_NAME=postgres
DB_PASSWORD=SUA_SENHA_DO_RDS
DB_PORT=5432
DB_SSL=true
DB_CONNECTION_TIMEOUT_MS=10000
```

Observacao: nunca envie a senha real do banco para repositorios publicos.

## Rodar Backend Localmente

Dentro da pasta `project/backend`:

```bash
npm install
npm start
```

Teste:

```bash
curl http://localhost:3000/tasks
```

## Rodar Backend com Docker

Dentro da pasta `project/backend`:

```bash
docker compose up -d --build
```

Ver containers:

```bash
docker ps
```

Ver logs:

```bash
docker logs todo-api
```

Testar dentro da EC2:

```bash
curl http://localhost:3000/tasks
```

Testar fora da EC2:

```text
http://IP_PUBLICO_DA_EC2:3000/tasks
```

## Importante Sobre Docker Compose

Se o `docker-compose.yml` definir `DB_HOST=postgres`, o backend usara um PostgreSQL local em container, nao o RDS.

Para usar RDS, o container precisa receber:

```env
DB_HOST=tododb.cozyt5tthfmg.us-east-1.rds.amazonaws.com
DB_SSL=true
```

Para conferir as variaveis reais dentro do container:

```bash
docker exec -it todo-api env | grep DB_
```

## Rotas da API

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/tasks` | Lista todas as tarefas |
| POST | `/tasks` | Cria uma tarefa |
| PUT | `/tasks/{id}` | Atualiza uma tarefa |
| DELETE | `/tasks/{id}` | Deleta uma tarefa |
| GET | `/report` | Relatorio gerado pela Lambda via API Gateway |

Arquivo com as rotas:

```text
ROUTES.txt
```

## Exemplos de Requisicoes

### Listar tarefas

```bash
curl http://IP_PUBLICO_DA_EC2:3000/tasks
```

### Criar tarefa

```bash
curl -X POST http://IP_PUBLICO_DA_EC2:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Teste RDS","description":"Criado pela API","status":"pending"}'
```

### Atualizar tarefa

```bash
curl -X PUT http://IP_PUBLICO_DA_EC2:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Teste RDS","description":"Atualizado pela API","status":"completed"}'
```

### Deletar tarefa

```bash
curl -X DELETE http://IP_PUBLICO_DA_EC2:3000/tasks/1
```

## RDS PostgreSQL

Banco usado:

```text
Amazon RDS PostgreSQL
```

Endpoint usado no projeto:

```text
tododb.cozyt5tthfmg.us-east-1.rds.amazonaws.com
```

Conectar pelo terminal da EC2:

```bash
psql -h tododb.cozyt5tthfmg.us-east-1.rds.amazonaws.com -U postgres -d postgres -p 5432
```

Queries uteis:

```sql
\dt
SELECT * FROM tasks ORDER BY id DESC;
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM tasks WHERE status = 'completed';
```

Relatorio equivalente ao da Lambda:

```sql
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status IN ('completed', 'complete', 'done', 'concluido', 'concluida')) AS completed,
  COUNT(*) FILTER (WHERE status NOT IN ('completed', 'complete', 'done', 'concluido', 'concluida')) AS pending
FROM tasks;
```

## Security Groups

Configuracao recomendada:

### EC2 do backend

Inbound:

| Tipo | Porta | Origem |
| --- | --- | --- |
| SSH | 22 | Seu IP |
| Custom TCP | 3000 | `0.0.0.0/0` |

### RDS

Inbound:

| Tipo | Porta | Origem |
| --- | --- | --- |
| PostgreSQL | 5432 | Security Group da EC2 do backend |

O RDS pode ficar privado se a EC2 estiver na mesma VPC e o Security Group permitir conexao.

## Lambda de Relatorio

Codigo:

```text
project/lambda/report/index.mjs
```

Nome usado na AWS:

```text
lamdaapitodo
```

Runtime:

```text
Node.js 20.x
```

Handler:

```text
index.handler
```

Variavel de ambiente:

```env
TASKS_API_URL=http://IP_PUBLICO_DA_EC2:3000/tasks
```

A Lambda faz:

1. Chama a URL configurada em `TASKS_API_URL`.
2. Busca todas as tarefas.
3. Conta o total.
4. Conta tarefas concluidas.
5. Calcula tarefas pendentes.
6. Retorna JSON.

Resposta esperada:

```json
{
  "total": 3,
  "completed": 1,
  "pending": 2,
  "generated_at": "2026-05-26T00:00:00.000Z"
}
```

## API Gateway

O projeto usa API Gateway para expor a rota:

```text
GET /report
```

Integracao:

```text
GET /report -> Lambda lamdaapitodo
```

Teste:

```text
https://SUA-API-GATEWAY.execute-api.us-east-1.amazonaws.com/report
```

Documentacao detalhada:

```text
project/docs/API_GATEWAY.md
```

Template CloudFormation:

```text
project/infra/api-gateway.yml
```

## Frontend

O frontend fica em:

```text
project/frontend
```

Tecnologias:

- HTML
- CSS
- JavaScript
- Nginx para Docker

Funcionalidades:

- configurar URL da API de tarefas;
- configurar URL do relatorio;
- listar tarefas;
- criar tarefas;
- editar tarefas;
- marcar tarefas como concluidas;
- excluir tarefas;
- exibir total, concluidas e pendentes.

Rodar localmente:

```bash
cd project/frontend
python -m http.server 4173
```

Acessar:

```text
http://localhost:4173
```

## Frontend com Docker

Dentro de `project/frontend`:

```bash
docker build -t todo-frontend .
docker run -d --name todo-frontend -p 8080:80 todo-frontend
```

Acessar:

```text
http://IP_PUBLICO_DA_EC2_FRONTEND:8080
```

Security Group da EC2 do frontend:

| Tipo | Porta | Origem |
| --- | --- | --- |
| SSH | 22 | Seu IP |
| Custom TCP | 8080 | `0.0.0.0/0` |

Tambem e possivel rodar na porta 80:

```bash
docker run -d --name todo-frontend -p 80:80 todo-frontend
```

Nesse caso, libere `HTTP 80` no Security Group.

## EC2 Amazon Linux - Instalar Docker

Na EC2 Amazon Linux:

```bash
sudo dnf update -y
sudo dnf install docker -y
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user
```

Depois saia do SSH e entre novamente.

Teste:

```bash
docker --version
docker ps
```

## Enviar Arquivos Para EC2

Exemplo usando `scp`:

```bash
scp -i sua-chave.pem -r project/frontend ec2-user@IP_DA_EC2:~/frontend
```

Na EC2:

```bash
cd ~/frontend
docker build -t todo-frontend .
docker run -d --name todo-frontend -p 8080:80 todo-frontend
```

Para backend em Ubuntu:

```bash
scp -i sua-chave.pem -r to_do_list_project ubuntu@IP_DA_EC2:/home/ubuntu/
```

## Chave PEM

A chave `.pem` so pode ser baixada no momento da criacao do Key Pair na AWS.

Se perder a chave:

- crie uma nova EC2 com uma nova chave;
- ou use EC2 Instance Connect, se estiver habilitado;
- ou adicione uma nova chave publica em `~/.ssh/authorized_keys`, caso ainda tenha algum acesso.

## Testes Recomendados no Postman

Crie uma collection chamada:

```text
To Do List API - AWS
```

Variaveis sugeridas:

```text
backend_url=http://IP_PUBLICO_DA_EC2:3000
api_gateway_url=https://SUA-API-GATEWAY.execute-api.us-east-1.amazonaws.com
```

Requests:

```text
GET {{backend_url}}/
GET {{backend_url}}/tasks
POST {{backend_url}}/tasks
PUT {{backend_url}}/tasks/1
DELETE {{backend_url}}/tasks/1
GET {{api_gateway_url}}/report
```

Body para criar tarefa:

```json
{
  "title": "Estudar Lambda",
  "description": "Criar rota /report",
  "status": "pending"
}
```

Body para atualizar tarefa:

```json
{
  "title": "Estudar Lambda",
  "description": "Criar rota /report funcionando",
  "status": "completed"
}
```

## Checklist de Validacao

1. `GET /tasks` retorna lista JSON.
2. `POST /tasks` cria uma tarefa e retorna `id`.
3. `SELECT * FROM tasks` no RDS mostra a tarefa criada.
4. `PUT /tasks/{id}` atualiza a tarefa.
5. `DELETE /tasks/{id}` remove a tarefa.
6. `GET /report` retorna `total`, `completed`, `pending` e `generated_at`.
7. Frontend lista tarefas e executa CRUD.
8. Frontend mostra os dados do relatorio.

## Problemas Comuns

### `Cannot GET /report`

Isso acontece ao chamar `/report` no backend Express. A rota `/report` pertence ao API Gateway/Lambda.

Use:

```text
https://SUA-API-GATEWAY.execute-api.us-east-1.amazonaws.com/report
```

### `Connection timed out` no RDS

Normalmente e Security Group, VPC ou subnet.

Verifique:

- EC2 e RDS estao na mesma VPC;
- RDS permite PostgreSQL 5432 vindo do Security Group da EC2;
- RDS esta com status `Available`.

### `password authentication failed for user "postgres"`

A rede funcionou, mas a senha esta errada.

Corrija `DB_PASSWORD` ou resete a senha no RDS.

### Tarefas aparecem na EC2, mas nao no RDS

Confira se o backend esta usando banco local:

```bash
docker exec -it todo-api env | grep DB_
```

Se aparecer:

```text
DB_HOST=postgres
```

o backend esta usando o container PostgreSQL local, nao o RDS.

### Lambda retorna `Hello from Lambda`

O codigo da Lambda ainda e o padrao da AWS. Cole o codigo de:

```text
project/lambda/report/index.mjs
```

Depois clique em **Deploy**.

## Prints Recomendados Para Entrega

- Postman com `POST /tasks` funcionando.
- Postman com `GET /tasks` mostrando tarefas.
- Terminal com `SELECT * FROM tasks` no RDS.
- Lambda com variavel `TASKS_API_URL`.
- API Gateway com rota `GET /report`.
- Resposta JSON do `/report`.
- EC2 com containers Docker rodando.
- RDS no console da AWS.
- Frontend funcionando no navegador.

## Status do Projeto

Etapas principais concluidas:

- Planejamento da entidade `tasks`.
- Backend CRUD em Express.
- Banco PostgreSQL no RDS.
- Docker para backend.
- Deploy do backend na EC2.
- API Gateway.
- Lambda `/report`.
- Frontend HTML/CSS/JS.
- Frontend Dockerizado.

## Referencias Internas

- Documentacao detalhada da API e RDS: `documentation/documentacao.md`
- Documentacao do API Gateway: `project/docs/API_GATEWAY.md`
- README antigo do projeto: `project/docs/README.md`
- README do frontend: `project/frontend/README.md`
- Checklist do projeto: `to_do.md`
