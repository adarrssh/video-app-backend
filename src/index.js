const app = require('./app');
const http = require('http');
const configureSocket = require('./socket');
const db = require('./db/db'); // Connect to MongoDB
db.connectDB()
const port = process.env.PORT || 4000;
const server = http.createServer(app);

configureSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
