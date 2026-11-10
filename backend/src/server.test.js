const test = require('node:test');
const assert = require('node:assert');
const { EventEmitter } = require('node:events');
const { server, tasks } = require('./server');

// Lightweight In-Memory Request Mock to avoid socket restrictions
function testRequest({ path = '/api/health', method = 'GET', body = null }) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.url = path;
    req.method = method;
    req.headers = { 'content-type': 'application/json' };

    let resHeaders = {};
    let statusCode = 200;
    let responseData = '';

    const res = {
      writeHead(code, headers) {
        statusCode = code;
        resHeaders = headers;
      },
      end(chunk) {
        if (chunk) responseData += chunk;
        let parsedBody = responseData;
        try {
          parsedBody = JSON.parse(responseData);
        } catch (e) {}
        resolve({
          statusCode,
          headers: resHeaders,
          body: parsedBody
        });
      }
    };

    server.emit('request', req, res);

    if (body) {
      req.emit('data', Buffer.from(JSON.stringify(body)));
    }
    req.emit('end');
  });
}

test('Health Check endpoint returns healthy status (Scenario 4)', async () => {
  const res = await testRequest({ path: '/api/health', method: 'GET' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.status, 'healthy');
  assert.strictEqual(res.body.service, 'git-workflow-backend');
});

test('GET /api/tasks returns initial task array', async () => {
  const res = await testRequest({ path: '/api/tasks', method: 'GET' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.count >= 1);
});

test('POST /api/tasks creates a new task (Scenario 1)', async () => {
  const newTask = {
    title: 'Automated CI Verification Task',
    description: 'Ensure workflow executes correctly',
    priority: 'High',
    status: 'Pending'
  };
  const res = await testRequest({ path: '/api/tasks', method: 'POST', body: newTask });
  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, newTask.title);
});

test('POST /api/tasks rejects invalid task without title (Validation check)', async () => {
  const invalidTask = { description: 'Missing title' };
  const res = await testRequest({ path: '/api/tasks', method: 'POST', body: invalidTask });
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.error, /Validation Error/);
});

test('Feature flag hides unfinished export feature (Trunk-Based check)', async () => {
  const res = await testRequest({ path: '/api/tasks/export', method: 'GET' });
  assert.strictEqual(res.statusCode, 403);
  assert.match(res.body.error, /Feature Flag ENABLE_TASK_EXPORT is disabled/);
});
