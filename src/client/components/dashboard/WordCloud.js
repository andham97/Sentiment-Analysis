import React, { Component } from 'react';
import '../style/WordCloud.css';
import { TagCloud } from 'react-tagcloud';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { SearchContext } from './SearchStore';

/**
 * @class WordCloud
 * @extends Component
 *
 * @reactProps {Object} history
 */
class WordCloud extends Component {
  constructor(props) {
    super(props);
    this.performSearchOnClick = this.performSearchOnClick.bind(this);
  }

  componentWillMount() {
    let count = 30;
    if (window.screen.width >= 550)
      count = 50;
    if (window.screen.width >= 2000)
      count = 70;
    this.context.getWords(count);
  }

  /**
   * Search on clicked word
   *
   * @function performSearchOnClick
   * @param  {string}             searchword
   */
  performSearchOnClick(searchword) {
    const opts = {
      checkedItemsNews: [],
      checkedItemsEmotion: [],
      show: false,
      startDate: 0,
      endDate: new Date().getTime(),
      news_search: '',
      search: searchword,
      neutralThreshold: 0.2,
    };
    this.context.getSearch(opts);
    this.props.history.push('/result');
  }

  render() {
    const colorOpinions = {
      luminosity: 'light',
      hue: 'blue',
    };
    return (
      <SearchContext.Consumer>
      {({ words }) => (
        <TagCloud
          minSize={18}
          maxSize={45}
          tags={words}
          className='tag-cloud clickable'
          colorOptions= {colorOpinions}
          onClick={tag => this.performSearchOnClick(tag.value)}
        />)
      }
      </SearchContext.Consumer>
    );
  }
}

WordCloud.propTypes = {
  history: PropTypes.any,
};

WordCloud.contextType = SearchContext;


export default withRouter(WordCloud);
