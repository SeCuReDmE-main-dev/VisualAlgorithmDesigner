const fs = require('fs');
const path = require('path');

const ALGORITHMS_DIRECTORY = path.resolve(__dirname, '..', '..', 'data', 'algorithms');
const MANIFEST_PATH = path.join(ALGORITHMS_DIRECTORY, 'manifest.json');

function inferValueType(parameter) {
  if (typeof parameter.default_value === 'boolean') return 'boolean';
  if (typeof parameter.default_value === 'number') return 'number';
  const description = String(parameter.description || '').toLowerCase();
  if (/\b(true|false|enabled|disabled|boolean)\b/.test(description)) return 'boolean';
  return 'text';
}

function loadH2OParameterCatalog() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const parameters = manifest.parameters.map((entry) => {
    const documentPath = path.resolve(ALGORITHMS_DIRECTORY, entry.file);
    if (!documentPath.startsWith(`${ALGORITHMS_DIRECTORY}${path.sep}`)) {
      throw new Error(`Unsafe H2O catalog path: ${entry.file}`);
    }
    const parameter = JSON.parse(fs.readFileSync(documentPath, 'utf8'));
    return {
      name: entry.name,
      file: entry.file,
      algorithms: entry.algorithms,
      type: entry.type,
      description: parameter.description || `Configure the H2O ${entry.name} parameter.`,
      defaultValue: parameter.default_value ?? null,
      valueType: inferValueType(parameter),
      sourceUrl: `${manifest.source}${entry.name}.html`,
    };
  });
  return {
    version: manifest.version,
    source: manifest.source,
    total: parameters.length,
    parameters,
  };
}

module.exports = { loadH2OParameterCatalog };
