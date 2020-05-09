
module.exports = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '3001',
  socketHost: process.env.WDS_SOCKET_HOST || 'localhost',
  socketPath: process.env.WDS_SOCKET_PATH || '/socket.io',
  socketUrl: process.env.REACT_APP_SOCKET_URL || 'http://synewaveshi.herokuapp.com/',
};