import React, { Component } from 'react';
import './style/WordCloud.css';
import { TagCloud } from 'react-tagcloud';
import { DashboardContext } from './DashboardStore';

class WordCloud extends Component {
  constructor(props) {
    super(props);
    this.state = {
      words: [],
    };
  }

  componentDidMount() {
    fetch('/api/wordcloud?length=30').then(res => res.json()).then((data) => {
      this.setState({
        words: data.map(elem => ({
          value: elem.key,
          count: elem.value,
        })),
      });
    });
  }

  render() {
    const colorOpinions = {
      luminosity: 'light',
      hue: 'blue',
    };
    return (
      <DashboardContext.Consumer>
        {({ setSearchWord }) => (
          <TagCloud
              minSize={18}
              maxSize={45}
              tags={this.state.words}
              colorOptions= {colorOpinions}
              onClick={tag => setSearchWord(tag.value)}/>
        )}
      </DashboardContext.Consumer>
    );
  }
}

export default WordCloud;
