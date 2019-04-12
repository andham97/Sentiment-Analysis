import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import Result from './components/result/Result';
import AdminPanel from './components/admin/AdminPanel';
import AdminPanelStore from './components/admin/AdminPanelStore';
import SearchStore from './components/dashboard/SearchStore';
// import ResultSentiment from './components/result/ResultSentiment';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <SearchStore>
          <Route exact path='/' component={Dashboard} />
          <Route path='/result' component={Result} />
        </SearchStore>
        <AdminPanelStore>
          <Route path='/admin' component={AdminPanel} />
        </AdminPanelStore>
      </BrowserRouter>
    );
  }
}

export default App;
