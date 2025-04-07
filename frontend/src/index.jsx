import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './store';
import App from './App';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <HelmetProvider>
          <App />
          <ToastContainer />
        </HelmetProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
