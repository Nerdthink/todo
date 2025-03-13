const http = require('http');
const fs = require('fs');
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const jsYaml = require('js-yaml');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const DefaultController = require('./controllers/DefaultController'); // Ensure this path is correct
const OpenApiValidator = require('express-openapi-validator');
const logger = require('./logger');
const config = require('./config');
const connectDB = require('./utils/db'); // Import the database connection utility

const rateLimit = require('express-rate-limit'); // Import rate limiter

// Define rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

class ExpressServer {
  constructor(port, openApiYaml) {
    this.port = port;
    this.app = express();
    this.openApiPath = openApiYaml;
    try {
      this.schema = jsYaml.safeLoad(fs.readFileSync(openApiYaml));
    } catch (e) {
      logger.error('failed to start Express Server', e.message);
    }
    this.setupMiddleware();
    this.setupRoutes(); // Add routes for the to-do app
  }

  setupMiddleware() {
    // Enable CORS
    this.app.use(cors({
      origin: '*', // Allow all origins (replace '*' with your frontend URL in production)
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
      allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    }));

    // Apply rate limiting
    this.app.use(limiter);

    this.app.use(bodyParser.json({ limit: '14MB' }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());

    // Serve the OpenAPI document
    this.app.get('/openapi', (req, res) => res.sendFile(path.join(__dirname, 'api', 'openapi.yaml')));

    // Serve the Swagger UI
    this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(this.schema));

    // Add OpenAPI Validator middleware
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: this.openApiPath,
        operationHandlers: path.join(__dirname, 'controllers'), // Ensure this path is correct
        fileUploader: { dest: config.FILE_UPLOAD_PATH },
      }),
    );

    // Add custom middleware (e.g., logger)
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url}`);
      next();
    });
  }

  setupRoutes() {
    // Connect to the database
    connectDB();

    // Define routes for the to-do app
    this.app.get('/todos', DefaultController.getTodos);
    this.app.post('/todos', DefaultController.addTodo);
    this.app.put('/todos/:id', DefaultController.updateTodo);
    this.app.delete('/todos/:id', DefaultController.deleteTodo);

    // Simple test route
    this.app.get('/hello', (req, res) => res.send(`Hello World. path: ${this.openApiPath}`));
  }

  launch() {
    // Error handling middleware
    this.app.use((err, req, res, next) => {
      res.status(err.status || 500).json({
        message: err.message || err,
        errors: err.errors || '',
      });
    });

    // Start the server
    http.createServer(this.app).listen(this.port, () => {
      console.log(`Listening on port ${this.port}`);
    });
  }

  async close() {
    if (this.server !== undefined) {
      await this.server.close();
      console.log(`Server on port ${this.port} shut down`);
    }
  }
}

module.exports = ExpressServer;