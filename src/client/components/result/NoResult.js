import React, { Component } from 'react';
import Card from '../Card';
import { SearchContext } from '../dashboard/SearchStore';
import Header from '../Header';

/**
 * @class NoResult
 * @extends Component
 */
class NoResult extends Component {
  render() {
    return (
      <React.Fragment>
        <Header class='result_header' name='Sentiment Analysis' />
        <Card>
          <p>Your search: {this.context.searchOpts.search} - did not match any documents</p>
          <h3>Suggestions:</h3>
          <ul>
            <li>Make sure that all words are spelled correctly.</li>
            <li>Try different keywords</li>
            <li>Try more general keywords</li>
            <li>Consult wordcloud for type of keywords searchable</li>
          </ul>
        </Card>
      </React.Fragment>
    );
  }
}

NoResult.contextType = SearchContext;

export default NoResult;
