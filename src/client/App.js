import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Result from './components/Result';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Route exact path='/' component={Dashboard} />
        <Route path='/result' component={Result} />
      </BrowserRouter>
    );
  }
}

export default App;
