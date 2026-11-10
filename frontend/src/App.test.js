const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Frontend TaskList component file exists and contains conflict anchor', () => {
  const taskListPath = path.join(__dirname, 'components', 'TaskList.jsx');
  assert.ok(fs.existsSync(taskListPath), 'TaskList.jsx must exist');
  const content = fs.readFileSync(taskListPath, 'utf8');
  assert.ok(content.includes('MERGE CONFLICT ZONE'), 'TaskList must contain Scenario 2 conflict anchor');
});

test('Frontend TaskForm component file exists', () => {
  const taskFormPath = path.join(__dirname, 'components', 'TaskForm.jsx');
  assert.ok(fs.existsSync(taskFormPath), 'TaskForm.jsx must exist');
  const content = fs.readFileSync(taskFormPath, 'utf8');
  assert.ok(content.includes('Create New Task'), 'TaskForm must contain submission handler');
});

test('Frontend App component file exists and routes API health', () => {
  const appPath = path.join(__dirname, 'App.jsx');
  assert.ok(fs.existsSync(appPath), 'App.jsx must exist');
  const content = fs.readFileSync(appPath, 'utf8');
  assert.ok(content.includes('/api/health'), 'App must check API health');
});

