const express = require('express');
const socket = require('socket.io');
const cors = require('cors');

const tasks = [];

const app = express();
app.use(cors());

app.get('*', (req, res) => {
  res.send('Not found ...');
});

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running on port: 8000');
});

const io = socket(server);
io.on('connection', socket => {
  console.log('New socket ', socket.id);
  socket.emit('updateData', tasks);
  socket.on('addTask', task => {
    console.log(`${socket.id} added ${task.name}`);
    tasks.push(task);
    socket.broadcast.emit('addTask', task);
  });
  socket.on('removeTask', id => {
    console.log(`${socket.id} removed task ${id}`);
    tasks.splice(tasks.findIndex(task => task.id === id),1);
    socket.broadcast.emit('removeTask', id);
  });
  socket.on('updateTask', newTask => {
    console.log(`${socket.id} updated task ${newTask.id}`);
    const task = tasks.find(task => task.id === newTask.id);
    task.name = newTask.name;
    socket.broadcast.emit('updateTask', newTask);
  });
});