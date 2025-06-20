import React, { useState, useEffect } from 'react';

// Main App Component
const TaskMateApp = () => { // Renamed from 'App' to 'TaskMateApp'
  // State variables for tasks, form inputs, and UI states
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskPriority, setTaskPriority] = useState('Low');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' or 'priority'
  const [loading, setLoading] = useState(true); // Still useful for initial localStorage load
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Load tasks from localStorage on initial component mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('taskmate_tasks');
      if (storedTasks) {
        // Parse stored tasks and convert deadline strings back to Date objects
        const parsedTasks = JSON.parse(storedTasks).map(task => ({
          ...task,
          deadline: task.deadline ? new Date(task.deadline) : null,
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      setModalMessage(`Error loading tasks: ${error.message}`);
      setShowModal(true);
    } finally {
      setLoading(false); // Set loading to false after attempting to load
    }
  }, []);

  // Save tasks to localStorage whenever the tasks state changes
  useEffect(() => {
    if (!loading) { // Only save after initial load is complete
      try {
        // Convert Date objects to ISO strings for consistent storage in localStorage
        const tasksToStore = tasks.map(task => ({
          ...task,
          deadline: task.deadline ? task.deadline.toISOString() : null,
        }));
        localStorage.setItem('taskmate_tasks', JSON.stringify(tasksToStore));
      } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
        setModalMessage(`Error saving tasks: ${error.message}`);
        setShowModal(true);
      }
    }
  }, [tasks, loading]);

  // Handle adding a new task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskName.trim() || !taskDeadline) {
      setModalMessage('Task Name and Deadline are required!');
      setShowModal(true);
      return;
    }

    const newTask = {
      id: crypto.randomUUID(), // Generate a unique ID for the task
      name: taskName,
      description: taskDescription,
      deadline: new Date(taskDeadline), // Store as Date object internally
      priority: taskPriority,
      completed: false,
      createdAt: new Date(), // Add creation timestamp
    };

    setTasks(prevTasks => [...prevTasks, newTask]);

    // Clear form fields
    setTaskName('');
    setTaskDescription('');
    setTaskDeadline('');
    setTaskPriority('Low');
  };

  // Handle toggling task completion status
  const handleToggleComplete = (taskId, currentStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !currentStatus } : task
      )
    );
  };

  // Handle confirming task deletion
  const confirmDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  // Handle deleting a task
  const handleDeleteTask = () => {
    if (!taskToDelete) return;

    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  // Filter and sort tasks for display
  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (filterStatus === 'All') return true;
      return filterStatus === 'Completed' ? task.completed : !task.completed;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        // Handle potential null deadlines by putting them at the end
        const deadlineA = a.deadline ? a.deadline.getTime() : Infinity;
        const deadlineB = b.deadline ? b.deadline.getTime() : Infinity;
        return deadlineA - deadlineB;
      } else if (sortBy === 'priority') {
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

  // Calculate dashboard metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Helper to check if deadline is near (within 24 hours)
  const isDeadlineNear = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading TaskMate...</div>
      </div>
    );
  }

  return (
    <>
      {/* Google Fonts Import for 'Inter' */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Internal CSS for the application */}
      <style>
        {`
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f3f4f6; /* gray-100 */
        }

        .loading-text {
          font-size: 1.25rem; /* text-xl */
          font-weight: 600; /* font-semibold */
          color: #374151; /* gray-700 */
        }

        .app-container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #eef2ff, #f3e8ff); /* from-indigo-50 to-purple-100 */
          padding: 1rem; /* p-4 */
          font-family: 'Inter', sans-serif;
          color: #2d3748; /* gray-800 */
        }

        .main-content {
          max-width: 56rem; /* max-w-4xl */
          margin-left: auto;
          margin-right: auto;
          padding: 1.5rem; /* p-6 */
          background-color: #ffffff; /* bg-white */
          border-radius: 1rem; /* rounded-2xl */
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); /* shadow-xl */
        }

        .app-title {
          font-size: 2.25rem; /* text-4xl */
          font-weight: 800; /* font-extrabold */
          text-align: center;
          color: #4338ca; /* indigo-700 */
          margin-bottom: 2rem; /* mb-8 */
          letter-spacing: -0.025em; /* tracking-tight */
        }

        .app-subtitle {
          display: block;
          font-size: 1.25rem; /* text-xl */
          color: #6b7280; /* gray-500 */
          margin-top: 0.5rem; /* mt-2 */
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr; /* grid-cols-1 */
          gap: 1rem; /* gap-4 */
          margin-bottom: 2rem; /* mb-8 */
        }

        @media (min-width: 768px) { /* md breakpoint */
          .dashboard-grid {
            grid-template-columns: repeat(3, 1fr); /* md:grid-cols-3 */
          }
        }

        .dashboard-card {
          padding: 1rem; /* p-4 */
          border-radius: 0.75rem; /* rounded-xl */
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .dashboard-card-blue {
          background-color: #dbeafe; /* blue-100 */
        }
        .dashboard-card-blue .label { color: #1d4ed8; } /* blue-700 */
        .dashboard-card-blue .value { color: #1e3a8a; } /* blue-900 */

        .dashboard-card-green {
          background-color: #dcfce7; /* green-100 */
        }
        .dashboard-card-green .label { color: #166534; } /* green-700 */
        .dashboard-card-green .value { color: #064e3b; } /* green-900 */

        .dashboard-card-yellow {
          background-color: #fef9c3; /* yellow-100 */
        }
        .dashboard-card-yellow .label { color: #a16207; } /* yellow-700 */
        .dashboard-card-yellow .value { color: #854d09; } /* yellow-900 */

        .dashboard-card .label {
          font-size: 1.125rem; /* text-lg */
          font-weight: 600; /* font-semibold */
        }
        .dashboard-card .value {
          font-size: 1.875rem; /* text-3xl */
          font-weight: 700; /* font-bold */
        }

        .form-section {
          background-color: #f9fafb; /* gray-50 */
          padding: 1.5rem; /* p-6 */
          border-radius: 0.75rem; /* rounded-xl */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
          margin-bottom: 2rem; /* mb-8 */
        }

        .form-section-title {
          font-size: 1.5rem; /* text-2xl */
          font-weight: 600; /* font-semibold */
          color: #4f46e5; /* indigo-600 */
          margin-bottom: 1rem; /* mb-4 */
        }

        .task-form {
          display: grid;
          grid-template-columns: 1fr; /* grid-cols-1 */
          gap: 1rem; /* gap-4 */
        }

        @media (min-width: 768px) { /* md breakpoint */
          .task-form {
            grid-template-columns: repeat(2, 1fr); /* md:grid-cols-2 */
          }
        }

        .form-field-full {
          grid-column: 1 / -1; /* col-span-full */
        }

        .form-label {
          display: block;
          font-size: 0.875rem; /* text-sm */
          font-weight: 500; /* font-medium */
          color: #374151; /* gray-700 */
          margin-bottom: 0.25rem; /* mb-1 */
        }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 0.75rem; /* p-3 */
          border: 1px solid #d1d5db; /* border border-gray-300 */
          border-radius: 0.5rem; /* rounded-lg */
          transition: border-color 200ms ease, box-shadow 200ms ease; /* transition duration-200 */
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: #6366f1; /* indigo-500 */
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5); /* ring-2 ring-indigo-300 */
        }

        .form-textarea {
          resize: vertical;
        }

        .form-submit-button-container {
          grid-column: 1 / -1; /* col-span-full */
          text-align: right;
        }

        .submit-button {
          padding: 0.75rem 1.5rem; /* px-6 py-3 */
          background-color: #4f46e5; /* indigo-600 */
          color: #ffffff; /* text-white */
          font-weight: 600; /* font-semibold */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
          border: none;
          cursor: pointer;
          transition: background-color 300ms ease, transform 300ms ease, box-shadow 300ms ease; /* transition duration-300 transform hover:scale-105 */
        }

        .submit-button:hover {
          background-color: #4338ca; /* hover:bg-indigo-700 */
          transform: scale(1.05);
        }

        .submit-button:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.5); /* focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 */
        }

        .task-list-header {
          display: flex;
          flex-direction: column; /* flex-col */
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem; /* mb-6 */
          background-color: #f9fafb; /* bg-gray-50 */
          padding: 1rem; /* p-4 */
          border-radius: 0.75rem; /* rounded-xl */
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); /* shadow-inner */
        }

        @media (min-width: 640px) { /* sm breakpoint */
          .task-list-header {
            flex-direction: row; /* sm:flex-row */
          }
        }

        .task-list-title {
          font-size: 1.5rem; /* text-2xl */
          font-weight: 600; /* font-semibold */
          color: #4f46e5; /* indigo-600 */
          margin-bottom: 1rem; /* mb-4 */
        }

        @media (min-width: 640px) { /* sm breakpoint */
          .task-list-title {
            margin-bottom: 0; /* sm:mb-0 */
          }
        }

        .filter-sort-controls {
          display: flex;
          gap: 1rem; /* space-x-4 */
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .task-list-empty-message {
          text-align: center;
          color: #6b7280; /* gray-500 */
          font-size: 1.125rem; /* text-lg */
          padding-top: 2rem; /* py-8 */
          padding-bottom: 2rem;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 1rem; /* space-y-4 */
        }

        .task-item {
          display: flex;
          flex-direction: column; /* flex-col */
          align-items: flex-start; /* items-start */
          padding: 1.25rem; /* p-5 */
          border-radius: 0.75rem; /* rounded-xl */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
          transition: all 300ms ease; /* transition-all duration-300 ease-in-out */
          border-left: 4px solid;
        }

        @media (min-width: 640px) { /* sm breakpoint */
          .task-item {
            flex-direction: row; /* sm:flex-row */
            align-items: center; /* sm:items-center */
          }
        }

        .task-item.completed {
          background-color: #f0fdf4; /* bg-green-50 */
          border-color: #4ade80; /* border-green-400 */
          opacity: 0.8;
        }

        .task-item.pending {
          background-color: #ffffff; /* bg-white */
          border-color: #818cf8; /* border-indigo-400 */
        }

        .task-item.deadline-near {
          box-shadow: 0 0 0 2px #ef4444, 0 0 0 4px #f9fafb; /* ring-2 ring-red-500 ring-offset-2 */
          animation: pulse-slight 2s infinite ease-in-out;
        }

        .task-checkbox {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          display: inline-block;
          height: 1.5rem; /* h-6 */
          width: 1.5rem; /* w-6 */
          min-width: 1.5rem; /* ensure it doesn't shrink */
          border: 2px solid #4f46e5; /* border and color */
          border-radius: 9999px; /* rounded-full */
          cursor: pointer;
          position: relative;
          top: 0; /* Align with text */
          margin-top: 0.25rem; /* mt-1 */
          flex-shrink: 0; /* flex-shrink-0 */
          transition: background-color 0.2s, border-color 0.2s;
        }

        .task-checkbox:checked {
          background-color: #4f46e5; /* indigo-600 */
          border-color: #4f46e5;
        }

        .task-checkbox:checked::after {
          content: '✓'; /* Checkmark for checked state */
          display: block;
          color: white;
          font-size: 1rem;
          line-height: 1.25rem;
          text-align: center;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        @media (min-width: 640px) { /* sm breakpoint */
          .task-checkbox {
            margin-top: 0; /* sm:mt-0 */
          }
        }

        .task-details {
          margin-left: 1rem; /* ml-4 */
          flex-grow: 1; /* flex-grow */
        }

        .task-name {
          font-size: 1.25rem; /* text-xl */
          font-weight: 600; /* font-semibold */
          color: #3730a3; /* indigo-800 */
        }

        .task-name.completed {
          color: #6b7280; /* gray-500 */
          text-decoration: line-through;
        }

        .task-description {
          color: #4b5563; /* gray-600 */
          font-size: 0.875rem; /* text-sm */
          margin-top: 0.25rem; /* mt-1 */
        }

        .task-meta {
          color: #6b7280; /* gray-500 */
          font-size: 0.875rem; /* text-sm */
          margin-top: 0.5rem; /* mt-2 */
        }

        .task-meta .label {
          font-weight: 500; /* font-medium */
        }

        .priority-tag {
          margin-left: 0.25rem; /* ml-1 */
          padding: 0.125rem 0.5rem; /* px-2 py-0.5 */
          border-radius: 9999px; /* rounded-full */
          font-size: 0.75rem; /* text-xs */
          font-weight: 600; /* font-semibold */
        }

        .priority-tag.high {
          background-color: #fee2e2; /* red-200 */
          color: #b91c1c; /* red-800 */
        }
        .priority-tag.medium {
          background-color: #fef9c3; /* yellow-200 */
          color: #a16207; /* yellow-800 */
        }
        .priority-tag.low {
          background-color: #e0e7ff; /* blue-200 */
          color: #3730a3; /* blue-800 */
        }

        .delete-button {
          margin-top: 1rem; /* mt-4 */
          margin-left: 0; /* ml-0 */
          padding: 0.5rem 1rem; /* px-4 py-2 */
          background-color: #ef4444; /* red-500 */
          color: #ffffff; /* text-white */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
          border: none;
          cursor: pointer;
          transition: background-color 300ms ease, transform 300ms ease, box-shadow 300ms ease; /* transition duration-300 transform hover:scale-105 */
          flex-shrink: 0; /* flex-shrink-0 */
        }

        .delete-button:hover {
          background-color: #dc2626; /* hover:bg-red-600 */
          transform: scale(1.05);
        }

        .delete-button:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.5); /* focus:ring-4 focus:ring-red-300 focus:ring-opacity-50 */
        }

        @media (min-width: 640px) { /* sm breakpoint */
          .delete-button {
            margin-top: 0; /* sm:mt-0 */
            margin-left: 1rem; /* sm:ml-4 */
          }
        }

        /* Custom Animation for deadline-near */
        @keyframes pulse-slight {
          0%, 100% {
            box-shadow: 0 0 0px rgba(255, 0, 0, 0);
          }
          50% {
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0; /* top:0; right:0; bottom:0; left:0; */
          background-color: rgba(75, 85, 99, 0.5); /* gray-600 with 50% opacity */
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 50;
        }

        .modal-content {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 24rem; /* max-w-sm */
          width: 100%;
          text-align: center;
        }

        .modal-title {
          font-size: 1.25rem; /* text-xl */
          font-weight: 600; /* font-semibold */
          color: #2d3748; /* gray-800 */
          margin-bottom: 1rem; /* mb-4 */
        }

        .modal-message {
          color: #4b5563; /* gray-600 */
          margin-bottom: 1.5rem; /* mb-6 */
        }

        .modal-button {
          padding: 0.5rem 1.5rem; /* px-6 py-2 */
          background-color: #4f46e5; /* indigo-600 */
          color: #ffffff;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .modal-button:hover {
          background-color: #4338ca; /* hover:bg-indigo-700 */
        }

        .modal-buttons-group {
          display: flex;
          justify-content: center;
          gap: 1rem; /* space-x-4 */
        }

        .modal-cancel-button {
          padding: 0.5rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          color: #374151;
          background-color: #ffffff;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .modal-cancel-button:hover {
          background-color: #f3f4f6;
        }

        .modal-delete-button {
          padding: 0.5rem 1.5rem;
          background-color: #ef4444;
          color: #ffffff;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .modal-delete-button:hover {
          background-color: #dc2626;
        }
        `}
      </style>

      <div className="app-container">
        <div className="main-content">
          <h1 className="app-title">
            TaskMate
            <span className="app-subtitle">Smart Task Manager with Local Storage</span>
          </h1>

          {/* Dashboard */}
          <div className="dashboard-grid">
            <div className="dashboard-card dashboard-card-blue">
              <p className="label">Total Tasks</p>
              <p className="value">{totalTasks}</p>
            </div>
            <div className="dashboard-card dashboard-card-green">
              <p className="label">Completed</p>
              <p className="value">{completedTasks}</p>
            </div>
            <div className="dashboard-card dashboard-card-yellow">
              <p className="label">Pending</p>
              <p className="value">{pendingTasks}</p>
            </div>
          </div>

          {/* Add New Task Form */}
          <div className="form-section">
            <h2 className="form-section-title">Add New Task</h2>
            <form onSubmit={handleAddTask} className="task-form">
              <div className="form-field-full">
                <label htmlFor="taskName" className="form-label">Task Name</label>
                <input
                  type="text"
                  id="taskName"
                  className="form-input"
                  placeholder="Enter task name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  required
                />
              </div>
              <div className="form-field-full">
                <label htmlFor="taskDescription" className="form-label">Description (Optional)</label>
                <textarea
                  id="taskDescription"
                  className="form-textarea"
                  rows="2"
                  placeholder="Briefly describe the task"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                ></textarea>
              </div>
              <div>
                <label htmlFor="taskDeadline" className="form-label">Deadline</label>
                <input
                  type="date"
                  id="taskDeadline"
                  className="form-input"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="taskPriority" className="form-label">Priority</label>
                <select
                  id="taskPriority"
                  className="form-select"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-submit-button-container">
                <button
                  type="submit"
                  className="submit-button"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>

          {/* Task List Header with Filters/Sort */}
          <div className="task-list-header">
            <h2 className="task-list-title">My Tasks</h2>
            <div className="filter-sort-controls">
              <div>
                <label htmlFor="filterStatus" className="sr-only">Filter by Status</label>
                <select
                  id="filterStatus"
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label htmlFor="sortBy" className="sr-only">Sort By</label>
                <select
                  id="sortBy"
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="deadline">Sort by Deadline</option>
                  <option value="priority">Sort by Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task List */}
          {filteredAndSortedTasks.length === 0 ? (
            <p className="task-list-empty-message">No tasks found. Add a new task to get started!</p>
          ) : (
            <div className="tasks-list">
              {filteredAndSortedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${task.completed ? 'completed' : 'pending'} ${isDeadlineNear(task.deadline) && !task.completed ? 'deadline-near' : ''}`}
                >
                  {/* Checkbox for completion */}
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id, task.completed)}
                    className="task-checkbox"
                  />

                  {/* Task Details */}
                  <div className="task-details">
                    <h3 className={`task-name ${task.completed ? 'completed' : ''}`}>
                      {task.name}
                    </h3>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <p className="task-meta">
                      <span className="label">Deadline:</span> {task.deadline ? task.deadline.toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="task-meta">
                      <span className="label">Priority:</span>
                      <span className={`priority-tag ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => confirmDeleteTask(task)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Modal for Alerts */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Notification</h3>
              <p className="modal-message">{modalMessage}</p>
              <button
                onClick={() => setShowModal(false)}
                className="modal-button"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Custom Modal for Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Confirm Deletion</h3>
              <p className="modal-message">
                Are you sure you want to delete the task: <br /><span style={{ fontWeight: 'bold' }}>"{taskToDelete?.name}"</span>?
              </p>
              <div className="modal-buttons-group">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="modal-cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="modal-delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TaskMateApp;