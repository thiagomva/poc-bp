import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import App from './components/App.jsx';
import { createAppStore } from './web3/Web3Store';
import { Web3Provider } from './web3/Web3Provider';
import { Provider } from 'react-redux';

// Require Editor JS files.
import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/js/third_party/embedly.min.js';
import 'froala-editor/js/plugins/align.min.js';
import 'froala-editor/js/plugins/colors.min.js';
import 'froala-editor/js/plugins/emoticons.min.js';
import 'froala-editor/js/plugins/image.min.js';
import 'froala-editor/js/plugins/font_size.min.js';
import 'froala-editor/js/plugins/link.min.js';

// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/third_party/embedly.min.css';
import 'froala-editor/css/plugins/colors.min.css';
import 'froala-editor/css/plugins/emoticons.min.css';
import 'froala-editor/css/plugins/image.min.css';
// bold italic underline color align link img embedly

// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';

import FroalaEditor from 'react-froala-wysiwyg';

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

  ReactDOM.render(<FroalaEditor tag='textarea'/>, document.getElementById('editor'));