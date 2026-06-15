const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { getSwaggerSpec } = require('../services/swaggerService');

const router = express.Router();
const swaggerDocument = getSwaggerSpec();

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

module.exports = router;
