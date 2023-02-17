const {httpServer} = require('./index.js');
const port = 3001;

httpServer.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});