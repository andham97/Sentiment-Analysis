import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import AdminPanel from './components/admin/AdminPanel';
import AdminPanelStore from './components/admin/AdminPanelStore';
import SearchStore from './components/dashboard/SearchStore';
import LoadingPage from './components/LoadingPage';
import ErrorBoundary from './components/ErrorBoundary';

class App extends Component {
  render() {
    return (
      <ErrorBoundary>
        <BrowserRouter>
          <SearchStore>
            <Route exact path='/' component={Dashboard} />
            <Route path='/result' component={LoadingPage} />
          </SearchStore>
          <AdminPanelStore>
            <Route path='/admin' component={AdminPanel} />
          </AdminPanelStore>
        </BrowserRouter>
      </ErrorBoundary>
    );
  }
}

export default App;
