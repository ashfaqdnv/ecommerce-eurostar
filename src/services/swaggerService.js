const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const swaggerPath = path.join(__dirname, '../../swagger.yaml');

let cachedSpec = null;

function getSwaggerSpec() {
  if (!cachedSpec) {
    const fileContents = fs.readFileSync(swaggerPath, 'utf8');
    cachedSpec = yaml.load(fileContents);
  }
  return cachedSpec;
}

module.exports = { getSwaggerSpec };
