import React, { Component } from 'react';
import '../style/WordCloud.css';
import { TagCloud } from 'react-tagcloud';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { SearchContext } from './SearchStore';

class WordCloud extends Component {
  constructor(props) {
    super(props);
    this.performSearchOnClick = this.performSearchOnClick.bind(this);
  }

  componentWillMount() {
    this.context.getWords();
  }

  performSearchOnClick(searchword) {
    this.context.getSearch(searchword);
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
