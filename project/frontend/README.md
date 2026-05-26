# Frontend - To Do AWS

Interface simples em HTML, CSS e JavaScript para testar o CRUD de tarefas e o relatorio da Lambda.

## Como rodar localmente

Abra o arquivo `index.html` no navegador ou suba um servidor estatico:

```bash
python -m http.server 4173
```

Depois acesse:

```txt
http://localhost:4173
```

## Como rodar com Docker

Na pasta `project/frontend`, rode:

```bash
docker build -t todo-frontend .
docker run -d --name todo-frontend -p 8080:80 todo-frontend
```

Depois acesse:

```txt
http://SEU-IP-DA-EC2:8080
```

## Configuracao

Na tela, preencha:

```txt
URL da API de tarefas: http://98.82.185.83:3000
URL do relatorio: https://SUA-API-GATEWAY.execute-api.us-east-1.amazonaws.com/report
```

Se a URL do relatorio ficar vazia, o frontend tenta chamar:

```txt
http://98.82.185.83:3000/report
```

Para o seu projeto AWS, o ideal e preencher a URL do API Gateway para o `/report`.

## Testes principais

- Criar tarefa com `POST /tasks`
- Listar tarefas com `GET /tasks`
- Editar tarefa com `PUT /tasks/{id}`
- Excluir tarefa com `DELETE /tasks/{id}`
- Ver estatisticas pelo `/report` da Lambda
