const ExpressServer = require('./expressServer');
const port = process.env.PORT || 3000;
const openApiYaml = './api/openapi.yaml';

const server = new ExpressServer(port, openApiYaml);
server.launch();