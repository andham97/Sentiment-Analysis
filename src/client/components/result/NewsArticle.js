import React, { Component } from 'react';
import '../style/NewsArticle.css';
import Proptypes from 'prop-types';
import ProgressBar from './graph/ProgressbarGraph';

class NewsArticle extends Component {
  render() {
    const {
      title, newssource, domFeeling, date, feelings, onClick,
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
            perc={ feelings.joy * 100 ? feelings.joy * 100 : 0 }
            color={ feelings.joy * 100 ? 'D3C0CD' : 0 }
          />
          Anger: <br /><ProgressBar
            perc={ feelings.anger * 100 ? feelings.anger * 100 : 0 }
            color={ feelings.anger * 100 ? 'E26D5A' : 0 }
          />
          Disgust: <br /><ProgressBar
            perc={ feelings.disgust * 100 ? feelings.disgust * 100 : 0 }
            color={ feelings.disgust * 100 ? '9FAF90' : 0 }
          />
          Sad: <br /><ProgressBar
            perc={ feelings.sadness * 100 ? feelings.sadness * 100 : 0 }
            color={ feelings.sadness * 100 ? '3D70B2' : 0 }
          />
          Fear: <br /><ProgressBar
            perc={ feelings.fear * 100 ? feelings.fear * 100 : 0 }
            color={ feelings.fear * 100 ? '3A405A' : 0 }
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
  domFeeling: Proptypes.any,
  emotions: Proptypes.any,
  feelings: Proptypes.any,
  persProgress: Proptypes.any,
  onClick: Proptypes.any,
};

export default NewsArticle;
