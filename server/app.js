const express = require('express');
const path = require('path');
const morgan = require('morgan');
const { createServer } = require('http');
const Server = require('socket.io');

require('dotenv').config();

const { port } = require('./config');

const app = express();
const server = createServer(app);
const io = Server(server);

server.listen(port, () => console.log(`Listening on http://localhost:${port}`));

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '/public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let numUsers = 0;
let currentUsers = [];

io.on('connect', socket => {
  let newUser = false;

  socket.on('add note', note => {
    console.log(`Broadcasting new note: ${note}`);
    socket.broadcast.emit('note added', {
      note,
    });
  });

  socket.on('add user', username => {
    if (newUser) return;

    socket.username = username;
    numUsers += 1;
    currentUsers.push({ id: numUsers, username })
    newUser = true;

    console.log(`
      New user: ${username}
      Num users: ${numUsers}
      Current users: ${currentUsers}
    `);

    socket.broadcast.emit('user joined', {
      username: socket.username,
      currentUsers,
      numUsers,
    });
  });

  socket.on('disconnect', () => {
    if (!newUser) return;

    numUsers -= 1;
    console.log(`${socket.username} disconnected`);
    currentUsers = currentUsers.filter(user => user.username !== socket.username);
    
    socket.username = undefined;
    console.log(`
      New user: ${socket.username}
      Current users: ${currentUsers}
      Num users: ${numUsers}
    `);

    socket.broadcast.emit('user left', {
      username: socket.username,
      currentUsers,
      numUsers,
    });
  });
});




