const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const morgan = require('morgan');
const socketIO = require('socket.io');

const server = http.Server(app);
const PORT = process.env.PORT || 80;
server.listen(PORT, () => console.log(`Listening at port ${PORT}...`));

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '/client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const io = socketIO(server);
let numUsers = 0;
let currentUsers = [];

io.on('connection', (socket) => {
  let newUser = false;

  socket.on('add note', (note) => {
    // console.log(`Broadcasting new note: ${note}`);
    socket.broadcast.emit('note added', {
      note,
    });
  });

  socket.on('add user', (username) => {
    if (newUser) return;

    socket.username = username;
    numUsers += 1;
    currentUsers.push({ id: numUsers, username });
    newUser = true;

    // console.log(`
    //   New user: ${username}
    //   Num users: ${numUsers}
    //   Current users: ${currentUsers}
    // `);

    socket.broadcast.emit('user joined', {
      username: socket.username,
      currentUsers,
      numUsers,
    });
  });

  socket.on('disconnect', () => {
    if (!newUser) return;

    numUsers -= 1;
    // console.log(`${socket.username} disconnected`);
    currentUsers = currentUsers.filter(
      (user) => user.username !== socket.username
    );

    socket.username = undefined;
    // console.log(`
    //   New user: ${socket.username}
    //   Current users: ${currentUsers}
    //   Num users: ${numUsers}
    // `);

    socket.broadcast.emit('user left', {
      username: socket.username,
      currentUsers,
      numUsers,
    });
  });
});
