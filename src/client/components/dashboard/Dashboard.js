import React, { Component } from 'react';
import Card from '../Card';
import '../style/Dashboard.css';
import NewSearch from './NewSearch';
import WordCloud from './WordCloud';
import Header from '../Header';

class Dashboard extends Component {
  render() {
    return [
      <Header key={1} class='dashboard_header' name = 'Dashboard'/>,
      <div key={2} className='wrapper'>
        <Card class='new_search' cName='new_search'>
            <NewSearch />
        </Card>
        <Card class='wordcloud' cName='wordcloud'>
            <WordCloud />
        </Card>
      </div>,
    ];
  }
}

export default Dashboard;
