import React, { Component } from 'react';
import './style/WordCloud.css';
import { TagCloud } from 'react-tagcloud';
import words from './wordcloud_words';

class WordCloud extends Component {
  render() {
    const colorOpinions = {
      luminosity: 'light',
      hue: 'blue',
    };
    return (
      <TagCloud
          minSize={18}
          maxSize={45}
          tags={words}
          colorOptions= {colorOpinions}
          onClick={tag => console.log(`'${tag.value}', '${tag.count}'`)}/>
    );
  }
}

export default WordCloud;
