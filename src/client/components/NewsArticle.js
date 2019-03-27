import React, { Component } from 'react';
import './style/NewsArticle.css';
import Proptypes from 'prop-types';
import ProgressBar from './ProgressbarGraph';

class NewsArticle extends Component {
  render() {
    const {
      title, newssource, domFeeling, date,
    } = this.props;
    return (
      <div className='newssource'>
        <div className='newsarticle_date'>{ date }</div>
        <div className='newsarticle_title'>{ title }</div>
        <div className='newsarticle_newssource'><span>News Source: </span>{ newssource }</div>
        <div className='newsarticle_highest_feeling'>Most prominent feeling:  <span className='newsarticle_highest_feeling_text'>{ domFeeling }</span></div>
        <div className='newsarticle_emotions'> <div className='row'><ProgressBar perc={10} /> <ProgressBar perc={20} /> <ProgressBar perc={50}/> </div></div>
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
};

export default NewsArticle;
