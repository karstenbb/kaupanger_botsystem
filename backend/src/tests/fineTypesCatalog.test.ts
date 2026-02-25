import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FINE_TYPES_CATALOG,
  FINE_TYPES_VERSION,
  FINE_TYPE_RENAMES,
} from '../domain/fineTypesCatalog';

test('fine type catalog has unique names', () => {
  const names = FINE_TYPES_CATALOG.map((fineType) => fineType.name);
  const uniqueNames = new Set(names);
  assert.equal(uniqueNames.size, names.length, 'Duplicate fine type names found in catalog');
});

test('fine type catalog has valid amounts and required fields', () => {
  assert.ok(FINE_TYPES_CATALOG.length > 0, 'Catalog must not be empty');

  for (const fineType of FINE_TYPES_CATALOG) {
    assert.ok(fineType.name.trim().length > 0, 'Fine type name must be set');
    assert.ok(fineType.category.trim().length > 0, 'Fine type category must be set');
    assert.ok(fineType.description.trim().length > 0, 'Fine type description must be set');
    assert.ok(Number.isFinite(fineType.amount), 'Fine type amount must be finite');
    assert.ok(fineType.amount >= 0, 'Fine type amount must be non-negative');
  }
});

test('seed metadata is present', () => {
  assert.match(FINE_TYPES_VERSION, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Object.keys(FINE_TYPE_RENAMES).length > 0);
});
