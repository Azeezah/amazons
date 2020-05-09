import React from 'react';
import ReactDOM from 'react-dom';
import Routing from './Routing';
import './firebase.js';

ReactDOM.render(
  <React.StrictMode>
    <Routing />
  </React.StrictMode>,
  document.getElementById("root")
);

