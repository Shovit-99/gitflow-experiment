// Base TaskList Component - Initial Version (Template Repository)
// In Scenario 2, Dev A and Dev B will concurrently modify this file

import React from 'react';

export default function TaskList({ tasks, onToggleStatus, onDeleteTask }) {
  if (!tasks || tasks.length === 0) {
    return <div className="no-tasks">No tasks found. Create a new task to get started!</div>;
  }

  // --- MERGE CONFLICT ZONE (Scenario 2) ---
  // Base implementation renders tasks directly without search or sorting controls
  const displayedTasks = tasks;
  // --- END ZONE ---

  return (
    <div className="task-list-container">
      <h3>Active Tasks ({displayedTasks.length})</h3>
      <div className="task-grid">
        {displayedTasks.map(task => (
          <div key={task.id} className={`task-card status-${task.status.toLowerCase()}`}>
            <div className="task-header">
              <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
              <span className="task-id">#{task.id}</span>
            </div>
            <h4>{task.title}</h4>
            <p>{task.description}</p>
            <div className="task-actions">
              <button onClick={() => onToggleStatus(task.id)}>
                Mark {task.status === 'Completed' ? 'Pending' : 'Completed'}
              </button>
              <button className="btn-delete" onClick={() => onDeleteTask(task.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

