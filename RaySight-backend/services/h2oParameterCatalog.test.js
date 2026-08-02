const { loadH2OParameterCatalog } = require('./h2oParameterCatalog');
const test = require('node:test');
const assert = require('node:assert/strict');

test('loads the complete attributed Appendix A bank', () => {
  const catalog = loadH2OParameterCatalog();
  assert.equal(catalog.total, 143);
  assert.match(catalog.source, /^https:\/\/docs\.h2o\.ai\//);
  const balanceClasses = catalog.parameters.find((entry) => entry.name === 'balance_classes');
  assert.equal(balanceClasses.valueType, 'boolean');
  assert.ok(balanceClasses.algorithms.includes('GBM'));
  assert.ok(balanceClasses.algorithms.includes('DRF'));
});
