import React, { Component } from 'react';
import Proptypes from 'prop-types';
import ProgressBar from './graph/ProgressbarGraph';
import '../style/NewsArticleSentiment.css';

class NewsArticle extends Component {
  render() {
    const {
      title, newssource, domSentiment, date, sentiments, onClick,
    } = this.props;

    return (
      <div className='newssource'>
        <div className='newsarticle_date'>{ date }</div>
        <div className='newsarticle_title'>{ title }</div>
        <div className='newsarticle_newssource'><span>News Source: </span>{ newssource }</div>
        <div className='newsarticle_highest_sentiment'>Most prominent sentiment:  <span className='newsarticle_highest_sentiment_text'>{ domSentiment }</span></div>
        <br />
        <div className='newsarticle_sentiment'>
          <div className='row'>
          Negative: <br /><ProgressBar
            perc={ sentiments.label === 'negative' ? -sentiments.score * 100 : 0 }
            color={ sentiments.label ? 'FF5C54' : 0 }
          />
          Neutral: <br /><ProgressBar
            perc={ sentiments.label === 'neutral' ? sentiments.score * 100 : 0 }
            color={ sentiments.label ? 'AFBE8F' : 0 }
          />
          Positive: <br /><ProgressBar
            perc={ sentiments.label === 'positive' ? sentiments.score * 100 : 0 }
            color={ sentiments.label ? '5EA3DB' : 0 }
          />
          </div>
          <br />
        </div>
        <button onClick = { onClick } className='to_article'>To Article</button>
        <br />
        <hr />
      </div>
    );
  }
}

NewsArticle.propTypes = {
  date: Proptypes.any,
  title: Proptypes.any,
  newssource: Proptypes.any,
  domSentiment: Proptypes.any,
  sentiments: Proptypes.any,
  persProgress: Proptypes.any,
  onClick: Proptypes.any,
};

export default NewsArticle;
