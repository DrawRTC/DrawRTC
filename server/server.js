const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);
const PORT = 3000;
const cookieParser = require('cookie-parser');

const { Server } = require('socket.io');


// REQUIRE ROUTER
const apiRouter = require('./routes/apiRouter');

// RUNNING SERVER

app.use(express.json());
app.use(cors());
app.use(cookieParser());

//SERVE BUILD DIR
app.use('/dist', express.static(path.join(__dirname, '../dist')));
//SERVE MAIN PAGE
app.get('/', (req, res) => {
  return res.sendFile(path.resolve(__dirname, '../index.html'));
});
//SERVE STATIC FILES
app.use('/', express.static(path.join(__dirname, '../src')));

//REROUTE API CALLS TO ROUTER
app.use('/api', apiRouter);

// GLOBAL ERROR ROUTE
app.get('*', (req, res) => {
  res.status(404).json({ Error: 'Unknown route error' });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: { err: 'An error occurred: unknown one' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

// <---- SOCKET CONNECTION ---->
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  socket.on('client-ready', () => {
    socket.broadcast.emit('get-canvas-state');
  });

  socket.on('canvas-state', (state) => {
    console.log('received canvas state');
    socket.broadcast.emit('canvas-state-from-server', state);
  });

  socket.on('draw-line', ({ prevPoint, currentPoint, color }) => {
    socket.broadcast.emit('draw-line', { prevPoint, currentPoint, color });
  });

  socket.on('clear', () => io.emit('clear'));
});
server.listen(3001, () => {
  console.log('✔️ Server listening on port 3001');
});

// STARTING SERVER
app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
