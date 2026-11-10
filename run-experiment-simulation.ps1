<#
.SYNOPSIS
    Interactive Simulation Runner for Git Workflow Optimization Lab
    Generates branches, commits, merge conflicts, and health checks for screenshots.
#>

param (
    [string]$Action = "menu"
)

function Show-Header {
    Clear-Host
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "   GIT WORKFLOW OPTIMIZATION LAB - EXPERIMENT SIMULATION TOOL    " -ForegroundColor Yellow
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Generate-GitFlow-Branches {
    Write-Host "`n[+] Generating Git Flow Branch Architecture (Screenshot 2)..." -ForegroundColor Green
    
    # Ensure on main
    git checkout main 2>$null
    
    # 1. Create develop
    git branch develop 2>$null
    git checkout develop
    
    # 2. Feature branch: create-task
    git checkout -b feature/create-task 2>$null
    git commit --allow-empty -m "feat(api): implement task creation endpoint"
    git checkout develop
    git merge --no-ff feature/create-task -m "Merge branch 'feature/create-task' into develop"
    
    # 3. Release branch: release/1.0.0
    git checkout -b release/1.0.0 2>$null
    git commit --allow-empty -m "chore(release): bump version to 1.0.0 and update changelog"
    
    # 4. Merge release into main and tag
    git checkout main
    git merge --no-ff release/1.0.0 -m "Merge branch 'release/1.0.0' into main"
    git tag -a v1.0.0 -m "Version 1.0.0 Production Release" -f
    
    # 5. Dual-merge release back into develop
    git checkout develop
    git merge --no-ff release/1.0.0 -m "Merge branch 'release/1.0.0' into develop"
    
    # 6. Hotfix branch: hotfix/task-validation
    git checkout main
    git checkout -b hotfix/task-validation 2>$null
    git commit --allow-empty -m "fix(security): sanitize title input payload in production"
    git checkout main
    git merge --no-ff hotfix/task-validation -m "Merge branch 'hotfix/task-validation' into main"
    git tag -a v1.0.1 -m "Hotfix v1.0.1" -f
    
    git checkout develop
    git merge --no-ff hotfix/task-validation -m "Merge branch 'hotfix/task-validation' into develop"

    Write-Host "`n[SUCCESS] Git Flow branch structure created successfully!" -ForegroundColor Green
    Write-Host "`nRun this command now to view and capture SCREENSHOT 2:" -ForegroundColor Yellow
    Write-Host "git log --graph --oneline --all --decorate`n" -ForegroundColor White
}

function Trigger-Merge-Conflict {
    Write-Host "`n[+] Inducing Scenario 2 Merge Conflict on TaskList.jsx (Screenshot 5)..." -ForegroundColor Green
    
    git checkout main 2>$null
    
    # Branch A: Developer A adds Search
    git checkout -b feature/task-search 2>$null
    $searchCode = @"
// Base TaskList Component - Developer A Search Feature
import React, { useState } from 'react';

export default function TaskList({ tasks, onToggleStatus, onDeleteTask }) {
  if (!tasks || tasks.length === 0) {
    return <div className="no-tasks">No tasks found. Create a new task to get started!</div>;
  }

  // --- MERGE CONFLICT ZONE (Scenario 2 - Dev A Search) ---
  const [searchQuery, setSearchQuery] = useState('');
  const displayedTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // --- END ZONE ---

  return (
    <div className="task-list-container">
      <input 
        type="text" 
        placeholder="Search tasks..." 
        value={searchQuery} 
        onChange={e => setSearchQuery(e.target.value)} 
      />
      <h3>Active Tasks ({displayedTasks.length})</h3>
    </div>
  );
}
"@
    Set-Content -Path "frontend/src/components/TaskList.jsx" -Value $searchCode
    git commit -am "feat(ui): add real-time task search filter"
    
    # Merge Branch A into main
    git checkout main
    git merge --no-ff feature/task-search -m "Merge feature/task-search into main"
    
    # Branch B: Developer B branched before Search was merged, adds Sorting
    git checkout -b feature/task-sorting HEAD~1 2>$null
    $sortCode = @"
// Base TaskList Component - Developer B Priority Sorting Feature
import React, { useState } from 'react';

export default function TaskList({ tasks, onToggleStatus, onDeleteTask }) {
  if (!tasks || tasks.length === 0) {
    return <div className="no-tasks">No tasks found. Create a new task to get started!</div>;
  }

  // --- MERGE CONFLICT ZONE (Scenario 2 - Dev B Sorting) ---
  const [sortOrder, setSortOrder] = useState('asc');
  const displayedTasks = [...tasks].sort((a, b) => 
    sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
  );
  // --- END ZONE ---

  return (
    <div className="task-list-container">
      <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
        <option value="asc">Alphabetical (A-Z)</option>
        <option value="desc">Alphabetical (Z-A)</option>
      </select>
      <h3>Active Tasks ({displayedTasks.length})</h3>
    </div>
  );
}
"@
    Set-Content -Path "frontend/src/components/TaskList.jsx" -Value $sortCode
    git commit -am "feat(ui): add alphabetical task sorting dropdown"
    
    # Attempt merge into main -> TRIGGERS REAL MERGE CONFLICT
    git checkout main
    Write-Host "`nAttempting to merge feature/task-sorting into main..." -ForegroundColor Yellow
    git merge feature/task-sorting
    
    Write-Host "`n[ALERT] REAL MERGE CONFLICT TRIGGERED!" -ForegroundColor Red
    Write-Host "Open frontend/src/components/TaskList.jsx in VS Code NOW to capture SCREENSHOT 5!" -ForegroundColor Yellow
    Write-Host "You will see <<<<<<< HEAD, =======, and >>>>>>> conflict markers." -ForegroundColor White
}

function Resolve-Merge-Conflict {
    Write-Host "`n[+] Applying Three-Way Merge Resolution..." -ForegroundColor Green
    
    $resolvedCode = @"
// Base TaskList Component - Resolved Version Combining Search AND Sorting
import React, { useState } from 'react';

export default function TaskList({ tasks, onToggleStatus, onDeleteTask }) {
  if (!tasks || tasks.length === 0) {
    return <div className="no-tasks">No tasks found. Create a new task to get started!</div>;
  }

  // --- MERGE CONFLICT ZONE (Scenario 2 - Three-Way Merge Resolved) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const displayedTasks = [...tasks]
    .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
  // --- END ZONE ---

  return (
    <div className="task-list-container">
      <div className="filter-controls">
        <input 
          type="text" 
          placeholder="Search tasks..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
        />
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="asc">A-Z</option>
          <option value="desc">Z-A</option>
        </select>
      </div>
      <h3>Active Tasks ({displayedTasks.length})</h3>
    </div>
  );
}
"@
    Set-Content -Path "frontend/src/components/TaskList.jsx" -Value $resolvedCode
    git add frontend/src/components/TaskList.jsx
    git commit -m "Merge branch 'feature/task-sorting' into main (resolved search + sort collision)"
    Write-Host "`n[SUCCESS] Conflict resolved cleanly via 3-way integration!" -ForegroundColor Green
    git status
}

function Test-HealthCheck-Endpoint {
    Write-Host "`n[+] Starting Local Backend API & Testing Health Endpoint (Screenshot 8)..." -ForegroundColor Green
    
    # Start server in background job
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "backend/src/server.js" -PassThru
    Start-Sleep -Seconds 2
    
    try {
        Write-Host "`nQuerying http://localhost:5000/api/health..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
        Write-Host "`n--- HEALTH CHECK RESPONSE (200 OK) ---" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 4 | Write-Host -ForegroundColor Cyan
        Write-Host "--------------------------------------" -ForegroundColor Green
        Write-Host "`nCapture this terminal output for SCREENSHOT 8!" -ForegroundColor Yellow
    }
    catch {
        Write-Host "Failed to reach health endpoint: $_" -ForegroundColor Red
    }
    finally {
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
}

# Interactive Menu
switch ($Action.ToLower()) {
    "gitflow"   { Generate-GitFlow-Branches }
    "conflict"  { Trigger-Merge-Conflict }
    "resolve"   { Resolve-Merge-Conflict }
    "health"    { Test-HealthCheck-Endpoint }
    default {
        Show-Header
        Write-Host "Select an experiment step to run:" -ForegroundColor White
        Write-Host "  1. Generate Git Flow Branch Architecture (Screenshot 2)"
        Write-Host "  2. Induce Real Merge Conflict on TaskList.jsx (Screenshot 5)"
        Write-Host "  3. Resolve Merge Conflict & Commit Three-Way Merge"
        Write-Host "  4. Test Staging Health Check Endpoint (Screenshot 8)"
        Write-Host "  Q. Quit"
        Write-Host ""
        $choice = Read-Host "Enter option [1-4, Q]"
        
        switch ($choice) {
            "1" { Generate-GitFlow-Branches }
            "2" { Trigger-Merge-Conflict }
            "3" { Resolve-Merge-Conflict }
            "4" { Test-HealthCheck-Endpoint }
            default { Write-Host "Exiting." }
        }
    }
}
