/**
 * main.jsx - Application bootstrap and entry point for WriteSpace Blog
 *
 * Application entry point. Imports React, ReactDOM, App component, and
 * index.css. Renders the App component into the root DOM element.
 * This is the bootstrap file referenced by index.html.
 *
 * Note: BrowserRouter is already rendered inside App.jsx, so it is not
 * duplicated here.
 *
 * User Stories: SCRUM-10770, SCRUM-10772
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);