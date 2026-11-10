# Empirical Scenario Execution & Reproduction Guide

This guide provides the exact branch commands and code changes to reproduce the four collaborative scenarios across **Git Flow**, **GitHub Flow**, and **Trunk-Based Development**.

---

### Scenario 1: Decoupled Feature Development
- **Developer A**: Implements Task Creation endpoint logic.
  - Branch: `feature/create-task`
  - Commits to `backend/src/server.js` (POST handler)
- **Developer B**: Implements Task List UI rendering.
  - Branch: `feature/task-list-ui`
  - Commits to `frontend/src/components/TaskList.jsx`
- **Result**: No conflict because changes are in separate directories/files.

---

### Scenario 2: Direct High-Collision Merge Conflict (Crucial for Screenshot 5)
Both developers edit the same file (`frontend/src/components/TaskList.jsx`) inside the conflict zone:

#### Developer A's Change (Search Bar):
```jsx
// --- MERGE CONFLICT ZONE (Scenario 2) ---
const [searchQuery, setSearchQuery] = React.useState('');
const displayedTasks = tasks.filter(t => 
  t.title.toLowerCase().includes(searchQuery.toLowerCase())
);
// --- END ZONE ---
```

#### Developer B's Change (Priority Sorting):
```jsx
// --- MERGE CONFLICT ZONE (Scenario 2) ---
const [sortOrder, setSortOrder] = React.useState('asc');
const displayedTasks = [...tasks].sort((a, b) => 
  sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
);
// --- END ZONE ---
```

#### Merge Conflict Manifestation:
When Developer B attempts to merge after Developer A's PR is merged into `develop` or `main`:
```git
CONFLICT (content): Merge conflict in frontend/src/components/TaskList.jsx
Automatic merge failed; fix conflicts and then commit the result.
```

#### Resolution (Three-Way Merge combining both):
```jsx
// --- MERGE CONFLICT ZONE (Scenario 2 - Resolved) ---
const [searchQuery, setSearchQuery] = React.useState('');
const [sortOrder, setSortOrder] = React.useState('asc');
const displayedTasks = [...tasks]
  .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  .sort((a, b) => sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
// --- END ZONE ---
```

---

### Scenario 3: Task Validation & Defect Remediation
- **Developer A**: Implements strict title validation (rejects strings < 3 characters).
- **Developer B**: Fixes bug where ID was overwritten during task updates.

---

### Scenario 4: Staging Deployment & Health Check
- Run local staging cluster:
  ```bash
  docker compose up -d --build
  ```
- Test health check:
  ```bash
  curl http://localhost:5000/api/health
  ```
- Simulate Deployment Failure:
  Introduce an unhandled exception or change port in backend to 9999, run `docker compose up -d`, observe health check failure.

