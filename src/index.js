import React from 'react';
import ReactDOM from 'react-dom/client';
import TaskMateApp from './taskform.js'; // Import the component from taskform.js
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"></link>
// This is where you connect your React app to the HTML page.
// The 'root' div is typically defined in your public/index.html file.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render your main TaskMateApp component into the root.
// React.StrictMode helps identify potential problems in an application.
root.render(
  <React.StrictMode>
    <TaskMateApp />
  </React.StrictMode>
);
