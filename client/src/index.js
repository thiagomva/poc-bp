import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import App from './components/App.jsx';
import { createAppStore } from './web3/Web3Store';
import { Web3Provider } from './web3/Web3Provider';
import { Provider } from 'react-redux';

// Require Sass file so webpack can build it
import bootstrap from 'bootstrap/dist/css/bootstrap.css';
import style from './styles/style.css';

ReactDOM.render((
  <Provider store={createAppStore()}>
    <BrowserRouter>
      <div className="container">
        <Web3Provider />
        <App />
      </div>
    </BrowserRouter>
  </Provider>
  ), document.getElementById('root'));
