//config dotenv here
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, `../env/${process.env.NODE_ENV}.env`);
dotenv.config({path: envPath});
const {httpServer} = require('./index.js');
const port = process.env.PORT;

httpServer.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});