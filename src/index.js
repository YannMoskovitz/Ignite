const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(401).json({ error: "Mensagem de erro!" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some(
    (user) => user.username === username);

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'Username already in use!' })
  };

  const info = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(info);

  return response.status(201).send(info);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const taskDetails = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(taskDetails);

  return response.status(201).send(taskDetails);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user, params } = request;
  const { id } = params;

  const myTodo = user.todos.find(todo => todo.id === id);
  if (myTodo === undefined) {
    return response.status(404).json({ error: "Invalid To Do" })
  }

  myTodo.title = title;
  myTodo.deadline = deadline;

  return response.status(201).send({ deadline, title, done: myTodo.done });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user, params } = request;
  const { id } = params;

  const myTodo = user.todos.find(todo => todo.id === id);
  if (myTodo === undefined) {
    return response.status(404).json({ error: "Invalid To Do" })
  }
  myTodo.done = true;

  return response.status(201).send(myTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, params } = request;
  const { id } = params;

  const myTodo = user.todos.find(todo => todo.id === id);
  if (myTodo === undefined) {
    return response.status(404).json({ error: "Invalid To Do" })
  }
  const index = user.todos.indexOf(myTodo)
  user.todos.splice(index, 1)

  return response.status(204).send();
});

module.exports = app;