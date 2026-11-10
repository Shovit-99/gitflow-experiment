import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [systemStatus, setSystemStatus] = useState('Checking...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setSystemStatus(data.status))
      .catch(() => setSystemStatus('Offline'));

    fetch('/api/tasks')
      .then(res => res.json())
      .then(payload => setTasks(payload.data || []))
      .catch(console.error);
  }, []);

  const handleAddTask = (newTask) => {
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setTasks(prev => [...prev, resData.data]);
        }
      });
  };

  const handleToggleStatus = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';

    fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setTasks(prev => prev.map(t => t.id === id ? resData.data : t));
        }
      });
  };

  const handleDeleteTask = (id) => {
    fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setTasks(prev => prev.filter(t => t.id !== id));
        }
      });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Task Management Dashboard</h1>
        <div className="system-pill">API Status: <span className={`status-${systemStatus.toLowerCase()}`}>{systemStatus}</span></div>
      </header>
      <main className="dashboard-layout">
        <section className="form-column">
          <TaskForm onAddTask={handleAddTask} />
        </section>
        <section className="list-column">
          <TaskList 
            tasks={tasks} 
            onToggleStatus={handleToggleStatus} 
            onDeleteTask={handleDeleteTask} 
          />
        </section>
      </main>
    </div>
  );
}

