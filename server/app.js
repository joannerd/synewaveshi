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

  socket.on('new message', data => {
    console.log(`Broadcasting new message: ${data}`);
    socket.broadcast.emit('new message', {
      message: data
    });
  });

  socket.on('add user', username => {
    if (newUser) return;

    socket.username = username;
    currentUsers.push(username)
    numUsers += 1;
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
    if (newUser) {
      numUsers -= 1;
      currentUsers = currentUsers.filter(user => user !== socket.username);
    }

    socket.broadcast.emit('user left', {
      username: socket.username,
      numUsers,
    });
  });
});




