import React from 'react';
import ReactDOM from 'react-dom';
import Handsfree from 'handsfree';
import App from './App';

// Include Handsfree.js and optional styles
import 'handsfree/build/lib/assets/handsfree.css';

/**
 * Setup handsfree.js
 */
window.handsfree = new Handsfree({
  pose: true,
  // hands: true,
  showDebug: true,
  // This is super important. Remember to eject the models into your public path
  // Everywhere else: cp -r node_modules/handsfree/build/lib/* public
  assetsPath: '/assets',
});

/**
 * Render App
 */
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
