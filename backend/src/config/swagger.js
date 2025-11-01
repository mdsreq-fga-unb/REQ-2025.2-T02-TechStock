const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'TechStock API',
    version: '1.0.0',
    description: 'Documentação da API do TechStock',
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Dev (localhost)',
    },
  ],
};

const options = {
  swaggerDefinition,
  // Aponta para os arquivos que contêm as anotações JSDoc
  apis: ['src/routes/**/*.js', 'src/controllers/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };
