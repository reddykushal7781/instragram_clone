import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { HelmetProvider } from 'react-helmet-async';



createRoot(document.getElementById("root")).render(
  <StrictMode>
       <Provider store={store}>
      <Router>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </Router>
    </Provider>
  </StrictMode>
);
