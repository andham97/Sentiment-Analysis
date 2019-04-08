import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Result from './components/Result';
import AdminPanel from './components/admin/AdminPanel';
import AdminPanelStore from './components/admin/AdminPanelStore';
import DashboardStore from './components/DashboardStore';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <DashboardStore>
          <Route exact path='/' component={Dashboard} />
        </DashboardStore>
        <Route path='/result' component={Result} />
        <AdminPanelStore>
          <Route path='/admin' component={AdminPanel} />
        </AdminPanelStore>
      </BrowserRouter>
    );
  }
}

export default App;
