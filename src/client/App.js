import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Result from './components/Result';
import DashboardStore from './components/DashboardStore';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <DashboardStore>
          <Route exact path='/' component={Dashboard} />
        </DashboardStore>
        <Route path='/result' component={Result} />
      </BrowserRouter>
    );
  }
}

export default App;
