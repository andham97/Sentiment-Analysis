import React, { Component } from 'react';
import './style/NewsArticle.css';
import Proptypes from 'prop-types';
import ProgressBar from './ProgressbarGraph';

class NewsArticle extends Component {
  render() {
    const {
      title, newssource, domFeeling, date, feelings,
    } = this.props;
    return (
      <div className='newssource'>
        <div className='newsarticle_date'>{ date }</div>
        <div className='newsarticle_title'>{ title }</div>
        <div className='newsarticle_newssource'><span>News Source: </span>{ newssource }</div>
        <div className='newsarticle_highest_feeling'>Most prominent feeling:  <span className='newsarticle_highest_feeling_text'>{ domFeeling }</span></div>
        <br />
        <div className='newsarticle_emotions'>
          <div className='row'>
          Joy: <br /><ProgressBar
            perc={ feelings.Joy ? feelings.Joy.perc : 0 }
            color={ feelings.Joy ? 'D3C0CD' : 0 }
          />
          Anger: <br /><ProgressBar
            perc={ feelings.Anger ? feelings.Anger.perc : 0 }
            color={ feelings.Anger ? 'E26D5A' : 0 }
          />
          Disgust: <br /><ProgressBar
            perc={ feelings.Disgust ? feelings.Disgust.perc : 0 }
            color={ feelings.Disgust ? '9FAF90' : 0 }
          />
          Sad: <br /><ProgressBar
            perc={ feelings.Sad ? feelings.Sad.perc : 0 }
            color={ feelings.Sad ? '3D70B2' : 0 }
          />
          Fear: <br /><ProgressBar
            perc={ feelings.Fear ? feelings.Fear.perc : 0 }
            color={ feelings.Fear ? '3A405A' : 0 }
          />
          </div>
          <br />
        </div>
        <button className='to_article'>To Article</button>
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
  domFeeling: Proptypes.any,
  emotions: Proptypes.any,
  feelings: Proptypes.any,
  persProgress: Proptypes.any,
};

export default NewsArticle;
