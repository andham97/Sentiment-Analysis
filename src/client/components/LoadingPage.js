import React, { Component } from 'react';
import './style/LoadingPage.css';
import loader from '../oda.gif';
import { SearchContext } from './dashboard/SearchStore';
import Result from './result/Result';
import ResultSentiment from './result/ResultSentiment';
import NoResult from './result/NoResult';

/**
 * @class LoadingPage
 * @extends Component
 */
class LoadingPage extends Component {
  componentDidMount() {
    if (!this.context.search && localStorage.getItem('prev-search') && !this.context.searchOpts)
      this.context.getSearch(JSON.parse(localStorage.getItem('prev-search')));
  }

  render() {
    if (!this.context.search)
      return (
        <React.Fragment>
          <img src={loader} />
          <div>{ this.context.search }</div>
        </React.Fragment>
      );
    if (this.context.search.docs.length === 0)
      return <NoResult />;
    if (this.context.searchType === 'emotion')
      return <Result />;
    if (this.context.searchType === 'sentiment')
      return <ResultSentiment />;
    return <NoResult />;
  }
}

LoadingPage.contextType = SearchContext;

export default LoadingPage;
