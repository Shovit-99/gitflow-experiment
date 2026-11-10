// Intelligent Git Workflow Optimization Lab - Backend Server
// Built with native Node.js HTTP to ensure 100% zero-dependency execution in CI & Local Environments
const http = require('http');

const PORT = process.env.PORT || 5000;

// In-Memory Task Database
let tasks = [
  { id: 1, title: 'Set up Git Flow repositories', description: 'Initialize main and develop branches', status: 'Completed', priority: 'High', createdAt: new Date().toISOString() },
  { id: 2, title: 'Configure GitHub Actions CI', description: 'Ensure automated test validation on PRs', status: 'Completed', priority: 'High', createdAt: new Date().toISOString() },
  { id: 3, title: 'Simulate Merge Conflict in TaskList', description: 'Concurrent changes by Dev A and Dev B', status: 'In Progress', priority: 'Medium', createdAt: new Date().toISOString() },
  { id: 4, title: 'Measure DORA metrics', description: 'Track integration time and conflict rates', status: 'Pending', priority: 'Urgent', createdAt: new Date().toISOString() }
];

// Feature Flags (Demonstrates Trunk-Based Development Feature Toggling)
const FEATURE_FLAGS = {
  ENABLE_TASK_EXPORT: process.env.ENABLE_TASK_EXPORT === 'true' || false,
  ENABLE_AI_PRIORITIZATION: false
};

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, 'http://localhost');
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // Health Check Endpoint (Used for Staging Deployment Verification - Scenario 4)
  if (method === 'GET' && path === '/api/health') {
    return sendJSON(res, 200, {
      status: 'healthy',
      service: 'git-workflow-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      featureFlags: FEATURE_FLAGS
    });
  }

  // GET All Tasks (with search & filter support)
  if (method === 'GET' && path === '/api/tasks') {
    let result = [...tasks];
    const search = parsedUrl.searchParams.get('search');
    const status = parsedUrl.searchParams.get('status');
    const sort = parsedUrl.searchParams.get('sort');

    if (search) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) || 
        t.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status) {
      result = result.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }
    if (sort === 'priority') {
      const priorityOrder = { 'Urgent': 1, 'High': 2, 'Medium': 3, 'Low': 4 };
      result.sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));
    }

    return sendJSON(res, 200, { success: true, count: result.length, data: result });
  }

  // POST Create New Task (Scenario 1 - Dev A)
  if (method === 'POST' && path === '/api/tasks') {
    try {
      const body = await parseRequestBody(req);
      if (!body.title || body.title.trim() === '') {
        return sendJSON(res, 400, { success: false, error: 'Validation Error: Title is required' });
      }

      const newTask = {
        id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        title: body.title.trim(),
        description: body.description || '',
        status: body.status || 'Pending',
        priority: body.priority || 'Medium',
        createdAt: new Date().toISOString()
      };

      tasks.push(newTask);
      return sendJSON(res, 201, { success: true, message: 'Task created successfully', data: newTask });
    } catch (err) {
      return sendJSON(res, 400, { success: false, error: 'Invalid JSON body' });
    }
  }

  // PUT Update Task (Trunk-Based Experiment - Dev A)
  const taskMatch = path.match(/^\/api\/tasks\/(\d+)$/);
  if (method === 'PUT' && taskMatch) {
    const id = parseInt(taskMatch[1], 10);
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return sendJSON(res, 404, { success: false, error: 'Task not found' });
    }

    try {
      const body = await parseRequestBody(req);
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...body,
        id // Keep original ID immutable
      };
      return sendJSON(res, 200, { success: true, message: 'Task updated successfully', data: tasks[taskIndex] });
    } catch (err) {
      return sendJSON(res, 400, { success: false, error: 'Invalid JSON body' });
    }
  }

  // DELETE Task
  if (method === 'DELETE' && taskMatch) {
    const id = parseInt(taskMatch[1], 10);
    const initialLen = tasks.length;
    tasks = tasks.filter(t => t.id !== id);
    if (tasks.length === initialLen) {
      return sendJSON(res, 404, { success: false, error: 'Task not found' });
    }
    return sendJSON(res, 200, { success: true, message: `Task ${id} deleted successfully` });
  }

  // Feature Flag Demo: Export Endpoint
  if (method === 'GET' && path === '/api/tasks/export') {
    if (!FEATURE_FLAGS.ENABLE_TASK_EXPORT) {
      return sendJSON(res, 403, { 
        success: false, 
        error: 'Feature Flag ENABLE_TASK_EXPORT is disabled in trunk branch' 
      });
    }
    return sendJSON(res, 200, { 
      success: true, 
      exportedAt: new Date().toISOString(), 
      data: tasks 
    });
  }

  // Fallthrough 404
  sendJSON(res, 404, { success: false, error: 'API endpoint not found' });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Git Workflow Lab] Backend API running at http://localhost:${PORT}`);
  });
}

module.exports = { server, tasks };
