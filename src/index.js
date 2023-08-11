const app = require('./app');
const http = require('http');
const configureSocket = require('./socket');

const port = process.env.PORT || 4000;
const server = http.createServer(app);

configureSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
