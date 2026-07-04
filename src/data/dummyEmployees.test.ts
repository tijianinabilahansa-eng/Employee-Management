import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmployees } from './dummyEmployees';

test('normalizeEmployees fills missing values and preserves valid ones', () => {
  const input = [
    {
      username: 'budi.test',
      firstName: 'Budi',
      lastName: 'Pratama',
      email: 'budi@example.com',
      birthDate: '1995-05-12T00:00:00.000Z',
      basicSalary: '8500000',
      status: 'Active',
      group: 'IT Support',
      description: '2024-01-01T00:00:00.000Z'
    },
    {
      username: '',
      firstName: '',
      lastName: '',
      email: 'invalid',
      birthDate: '',
      basicSalary: undefined,
      status: '',
      group: '',
      description: ''
    }
  ];

  const result = normalizeEmployees(input as any);

  assert.equal(result[0].username, 'budi.test');
  assert.equal(result[0].firstName, 'Budi');
  assert.equal(result[0].basicSalary, 8500000);
  assert.equal(result[1].username, 'employee-2');
  assert.equal(result[1].firstName, 'Employee');
  assert.equal(result[1].lastName, '2');
  assert.equal(result[1].basicSalary, 0);
  assert.equal(result[1].status, 'Active');
  assert.equal(result[1].group, 'Unassigned');
});
