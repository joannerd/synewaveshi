const app = require('express')();
const server = require('http').Server(app);
const path = require('path');
const morgan = require('morgan');
const io = require('socket.io')(server);

// const io = socketIO(server, {
//   serveClient: true,
// });

server.listen(80);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '/client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

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
