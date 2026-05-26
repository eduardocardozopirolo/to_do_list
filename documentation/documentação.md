# Detalhamento da criacao da API

Antes da configuracao do Amazon RDS, foi criada uma API local para gerenciar uma lista de tarefas. A API foi desenvolvida em Node.js com Express, usando PostgreSQL como banco de dados e a biblioteca `pg` para executar as consultas SQL.

## 1. Estrutura inicial do backend

O backend foi organizado dentro da pasta:

```text
project/backend
```

A estrutura principal ficou assim:

```text
project/backend
|-- package.json
|-- .env
`-- src
    |-- server.js
    |-- db.js
    `-- routes
        `-- task.js
```

Cada arquivo recebeu uma responsabilidade:

- `server.js`: inicia o servidor Express, configura middlewares e registra as rotas.
- `db.js`: centraliza a conexao com o PostgreSQL.
- `routes/task.js`: define as rotas de CRUD das tarefas.
- `.env`: guarda as variaveis de ambiente usadas pela API.
- `package.json`: registra dependencias e o comando de execucao do projeto.

## 2. Inicializacao do projeto Node.js

O projeto da API foi configurado como uma aplicacao Node.js. No `package.json`, o arquivo principal definido foi:

```json
"main": "src/server.js"
```

Tambem foi criado o script de inicializacao:

```json
"scripts": {
  "start": "node src/server.js"
}
```

Com isso, a API pode ser executada com:

```powershell
npm start
```

## 3. Dependencias utilizadas

As principais dependencias adicionadas ao backend foram:

- `express`: framework usado para criar o servidor HTTP e as rotas da API.
- `pg`: biblioteca usada para conectar e consultar o banco PostgreSQL.
- `dotenv`: biblioteca usada para carregar variaveis de ambiente do arquivo `.env`.
- `cors`: middleware usado para permitir requisicoes de outras origens, como um frontend local.

No `package.json`, elas aparecem em `dependencies`:

```json
"dependencies": {
  "express": "^4.18.2",
  "pg": "^8.11.0",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5"
}
```

## 4. Criacao do servidor Express

O arquivo `project/backend/src/server.js` foi criado para inicializar a API.

Primeiro, foram importadas as dependencias principais:

```js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
```

Depois, a aplicacao Express foi criada e recebeu os middlewares:

```js
const app = express();

app.use(cors());
app.use(express.json());
```

O `cors()` permite que outras aplicacoes acessem a API. O `express.json()` permite que a API leia corpos de requisicao enviados em JSON, como os dados de uma nova tarefa.

Em seguida, as rotas de tarefas foram importadas e registradas no caminho `/tasks`:

```js
const taskRoutes = require("./routes/task");
app.use("/tasks", taskRoutes);
```

Tambem foi criada uma rota raiz simples para confirmar que a API esta em execucao:

```js
app.get("/", (req, res) => {
  res.send("API rodando");
});
```

Por fim, a API passou a escutar a porta definida no `.env` ou, caso ela nao exista, a porta `3000`:

```js
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
```

## 5. Criacao da conexao com o banco

O arquivo `project/backend/src/db.js` foi criado para separar a configuracao do banco do restante da API.

Nele, foi importado o `Pool` da biblioteca `pg`:

```js
const { Pool } = require("pg");
require("dotenv").config();
```

Depois, foi criado um pool de conexoes usando as variaveis de ambiente:

```js
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 10000,
});
```

Essa abordagem evita deixar dados sensiveis diretamente no codigo, como senha, host e nome do banco.

No final, o pool foi exportado para ser usado pelas rotas:

```js
module.exports = pool;
```

## 6. Criacao da tabela de tarefas

No banco PostgreSQL, foi criada a tabela `tasks`, responsavel por armazenar as tarefas da aplicacao:

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Os campos definidos foram:

- `id`: identificador unico e automatico de cada tarefa.
- `title`: titulo da tarefa.
- `description`: descricao da tarefa.
- `status`: situacao atual da tarefa.
- `created_at`: data e hora em que a tarefa foi criada.

## 7. Criacao das rotas da API

As rotas foram criadas no arquivo:

```text
project/backend/src/routes/task.js
```

Esse arquivo usa `express.Router()` para separar as rotas de tarefas do arquivo principal do servidor:

```js
const express = require("express");
const router = express.Router();
const pool = require("../db");
```

Foram implementadas quatro operacoes principais de CRUD:

### Listar tarefas

Rota:

```http
GET /tasks
```

Consulta usada:

```sql
SELECT * FROM tasks ORDER BY id
```

Essa rota retorna todas as tarefas cadastradas no banco.

### Criar tarefa

Rota:

```http
POST /tasks
```

Campos esperados no corpo da requisicao:

```json
{
  "title": "Titulo da tarefa",
  "description": "Descricao da tarefa",
  "status": "pendente"
}
```

Consulta usada:

```sql
INSERT INTO tasks (title, description, status)
VALUES ($1, $2, $3)
RETURNING *
```

O uso de `$1`, `$2` e `$3` evita montar SQL por concatenacao e ajuda a proteger a aplicacao contra injecao de SQL.

### Atualizar tarefa

Rota:

```http
PUT /tasks/:id
```

Essa rota recebe o `id` pela URL e os novos dados pelo corpo da requisicao.

Consulta usada:

```sql
UPDATE tasks
SET title=$1, description=$2, status=$3
WHERE id=$4
RETURNING *
```

### Deletar tarefa

Rota:

```http
DELETE /tasks/:id
```

Consulta usada:

```sql
DELETE FROM tasks WHERE id=$1
```

Ao final, a API retorna uma mensagem informando que a tarefa foi deletada.

## 8. Tratamento de erros

Foi criada uma funcao auxiliar para padronizar os erros retornados pela API:

```js
function handleError(res, error) {
  console.error("Database error:", error);
  res.status(500).json({
    error: "Erro ao acessar o banco de dados",
    detail: error.message,
  });
}
```

Com isso, quando ocorre algum problema de conexao, SQL, senha, SSL ou tabela inexistente, a resposta vem em JSON com uma mensagem geral e o detalhe tecnico do erro.

## 9. Fluxo geral da API

O fluxo final ficou assim:

```text
Cliente HTTP
  -> servidor Express em server.js
  -> rota /tasks
  -> arquivo routes/task.js
  -> pool de conexao em db.js
  -> banco PostgreSQL
  -> resposta JSON para o cliente
```

Assim, a API ficou preparada para receber requisicoes HTTP, executar operacoes no banco de dados e devolver respostas em JSON.

# Configuracao RDS Guide

Este guia documenta a configuracao feita no Amazon RDS PostgreSQL para o projeto `to_do_list_project`.

## 1. Identificar a instancia RDS

O endpoint usado inicialmente foi:

```bash
database-2.cozyt5tthfmg.us-east-1.rds.amazonaws.com
```

Esse valor e o endpoint do banco, nao o identificador da instancia.

O identificador correto da instancia era:

```bash
database-2
```

## 2. Verificar se o RDS estava publico

Foi usado o comando:

```bash
aws rds describe-db-instances \
  --db-instance-identifier database-2 \
  --query "DBInstances[0].PubliclyAccessible"
```

O retorno inicial foi:

```bash
false
```

Isso indicava que o banco nao estava acessivel publicamente.

## 3. Tornar o RDS publicamente acessivel

Foi executado:

```bash
aws rds modify-db-instance \
  --db-instance-identifier database-2 \
  --publicly-accessible
```

Depois, foi necessario aguardar a instancia voltar ao estado `available`.

Para acompanhar o status:

```bash
aws rds describe-db-instances \
  --db-instance-identifier database-2 \
  --query "DBInstances[0].{Status:DBInstanceStatus,Public:PubliclyAccessible,Endpoint:Endpoint.Address}" \
  --output table
```

O resultado esperado era:

```text
Status: available
Public: True
```

## 4. Security Group usado pelo RDS

O Security Group associado ao RDS era:

```bash
sg-0a414b67abf788955
```

Para conectar de fora da VPC, alem de deixar o RDS publico, e necessario liberar a porta `5432` no Security Group para o IP de origem.

Para descobrir o IP publico:

```bash
curl ifconfig.me
```

Para liberar o IP na porta do PostgreSQL:

```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-0a414b67abf788955 \
  --protocol tcp \
  --port 5432 \
  --cidr SEU_IP/32
```

Exemplo:

```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-0a414b67abf788955 \
  --protocol tcp \
  --port 5432 \
  --cidr 200.100.50.25/32
```

## 5. Conectar no PostgreSQL com psql

Como o RDS exigiu conexao criptografada, foi necessario usar `sslmode=require`.

Comando usado:

```bash
psql "host=database-2.cozyt5tthfmg.us-east-1.rds.amazonaws.com port=5432 user=postgres dbname=postgres sslmode=require"
```

Depois de executar o comando, o terminal pediu a senha do usuario `postgres`.

Quando a conexao funcionou, o terminal entrou no prompt do PostgreSQL:

```text
postgres=>
```

## 6. Criar a tabela tasks

Dentro do `psql`, foi criada a tabela `tasks`:

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Essa tabela segue os campos definidos no projeto:

- `id`: identificador automatico da tarefa.
- `title`: titulo da tarefa.
- `description`: descricao da tarefa.
- `status`: status da tarefa, por exemplo `pendente` ou `concluido`.
- `created_at`: data e hora de criacao do registro.

## 7. Verificar se a tabela foi criada

Para listar as tabelas do banco:

```sql
\dt
```

Para ver a estrutura da tabela:

```sql
\d tasks
```

Para consultar os dados:

```sql
SELECT * FROM tasks;
```

## 8. Inserir um dado de teste

Exemplo de insercao:

```sql
INSERT INTO tasks (title, description, status)
VALUES ('Primeira tarefa', 'Teste no RDS', 'pendente');
```

Consulta para validar:

```sql
SELECT * FROM tasks;
```

## 9. Sair do psql

Para encerrar a conexao:

```sql
\q
```

## Observacoes importantes

- O endpoint do RDS nao e o mesmo valor que o identificador da instancia.
- Para comandos `aws rds describe-db-instances`, use o identificador `database-2`, nao o endpoint completo.
- Para acesso externo, o RDS precisa estar com `PubliclyAccessible = true`.
- O Security Group tambem precisa liberar a porta `5432`.
- No projeto real, o mais seguro em producao e deixar o RDS privado e conectar a API a partir de uma EC2, ECS ou Lambda dentro da mesma VPC.
- Como o RDS exigiu SSL, a conexao com `psql` precisou usar `sslmode=require`.

## 10. Atualizar a API local para conectar no RDS

O backend foi ajustado para usar variaveis de ambiente na conexao com o banco.

Arquivo alterado:

```text
project/backend/src/db.js
```

Configuracao usada:

```js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 10000,
});

module.exports = pool;
```

O arquivo `.env` do backend ficou apontando para o RDS:

```env
DB_HOST=tododb.cozyt5tthfmg.us-east-1.rds.amazonaws.com
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_DO_RDS
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
DB_CONNECTION_TIMEOUT_MS=10000
PORT=3000
```

Depois de qualquer alteracao no `.env`, a API precisa ser reiniciada:

```powershell
cd C:\Users\edupi\to_do_list_project\project\backend
npm start
```

## 11. Corrigir o endpoint depois de renomear a instancia

Depois que a instancia foi renomeada para `tododb`, o endpoint antigo deixou de funcionar:

```text
database-2.cozyt5tthfmg.us-east-1.rds.amazonaws.com
```

O erro retornado pela API foi:

```json
{
  "error": "Erro ao acessar o banco de dados",
  "detail": "getaddrinfo ENOTFOUND database-2.cozyt5tthfmg.us-east-1.rds.amazonaws.com"
}
```

Para descobrir o endpoint atualizado, foi usado:

```bash
aws rds describe-db-instances \
  --db-instance-identifier tododb \
  --query "DBInstances[0].Endpoint.Address" \
  --output text
```

O endpoint correto retornado foi:

```text
tododb.cozyt5tthfmg.us-east-1.rds.amazonaws.com
```

Esse valor foi colocado em `DB_HOST`.

## 12. Diagnosticar timeout da API local

Depois que o endpoint foi corrigido, a API local passou a dar timeout.

Foi testado no AWS CloudShell:

```bash
nc -vz tododb.cozyt5tthfmg.us-east-1.rds.amazonaws.com 5432
```

Resultado:

```text
Ncat: Connected to 44.193.115.250:5432.
```

Isso mostrou que o CloudShell conseguia chegar no RDS.

No computador local, o teste foi:

```powershell
Test-NetConnection tododb.cozyt5tthfmg.us-east-1.rds.amazonaws.com -Port 5432
```

Resultado antes da correcao:

```text
TcpTestSucceeded : False
```

Isso mostrou que o Security Group estava liberando o IP do CloudShell, mas nao o IP publico do computador local.

## 13. Liberar o IPv4 publico do PC no Security Group

No PowerShell do computador local, foi usado:

```powershell
curl.exe -4 ifconfig.me
```

Esse comando retorna o IPv4 publico do computador/rede local.

Depois, esse IP foi liberado no Security Group do RDS:

```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-0a414b67abf788955 \
  --protocol tcp \
  --port 5432 \
  --cidr SEU_IPV4_PUBLICO/32
```

Exemplo:

```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-0a414b67abf788955 \
  --protocol tcp \
  --port 5432 \
  --cidr 187.55.10.20/32
```

Foi importante usar IPv4 porque o teste para o RDS estava indo para um endereco IPv4:

```text
RemoteAddress : 44.193.115.250
```

## 14. Validar a conexao do PC com o RDS

Depois de liberar o IPv4 publico do PC, o teste foi repetido:

```powershell
Test-NetConnection tododb.cozyt5tthfmg.us-east-1.rds.amazonaws.com -Port 5432
```

O resultado esperado:

```text
TcpTestSucceeded : True
```

Com isso, a API local conseguiu acessar o banco RDS.

## 15. Tratamento de erro nas rotas da API

As rotas de `tasks` foram ajustadas para retornar erros de banco em JSON, ajudando a identificar o problema real.

Arquivo alterado:

```text
project/backend/src/routes/task.js
```

Exemplo de resposta:

```json
{
  "error": "Erro ao acessar o banco de dados",
  "detail": "mensagem real do erro"
}
```

Esse tratamento ajudou a diagnosticar:

- endpoint incorreto;
- timeout por Security Group;
- senha incorreta;
- exigencia de SSL;
- tabela inexistente.

## 16. Acessar a EC2 com chave PEM pelo Windows

Para subir a aplicacao em uma instancia EC2 usando Docker, foi necessario criar uma nova EC2 porque a chave privada `.pem` anterior tinha sido apagada.

Esse ponto e importante: a AWS permite baixar a chave privada `.pem` somente no momento da criacao do Key Pair. Se esse arquivo for perdido, nao e possivel baixa-lo novamente pela AWS. Nesse caso, a solucao usada foi apagar a EC2 antiga e criar outra instancia associada a uma nova chave.

Depois de criar a nova EC2 e baixar a chave privada, o acesso SSH pelo Windows PowerShell funcionou com:

```powershell
ssh -i .\minhaChave.pem ubuntu@98.83.149.213
```

Com isso, ja foi possivel acessar a EC2 pelo SSH usando o terminal do Windows.

Onde:

- `.\minhaChave.pem` e o caminho da chave privada no computador local.
- `ubuntu` e o usuario padrao da AMI Ubuntu.
- `98.83.149.213` e o IP publico da instancia EC2.

Foi importante usar a chave privada `.pem`, e nao a chave publica `.pub`.

## 17. Copiar os arquivos locais para a EC2 com SCP

Depois que o acesso SSH foi confirmado, os arquivos do projeto foram copiados do computador local para a EC2 usando `scp`.

No Windows PowerShell, o comando usado foi:

```powershell
scp -i .\minhaChave.pem -r C:\Users\edupi\to_do_list_project ubuntu@98.83.149.213:/home/ubuntu/
```

Onde:

- `-i .\minhaChave.pem` indica a chave privada usada para autenticar.
- `-r` copia a pasta inteira de forma recursiva.
- `C:\Users\edupi\to_do_list_project` e a pasta local do projeto.
- `ubuntu@98.83.149.213:/home/ubuntu/` e o destino dentro da EC2.

Depois da copia, o projeto ficou disponivel na instancia em:

```text
/home/ubuntu/to_do_list_project
```

