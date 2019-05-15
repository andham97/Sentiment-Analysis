import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../style/Parameters.css';
import Button from '../Button';

class Paramteres extends Component {
  render() {
    const {
      searchtext,
    } = this.props;
    const arr = ['sentiment', 'timeinterval', 'amount', 'threshold'];
    return (
      <div className='parameters'>
        <div><span className='search_text'>You searched for:</span> { searchtext }</div>
        <ul className='applied_filters'>
          {arr.filter((e => this.props[e])).map(e => <li key={e}>{this.props[e]}</li>)}
        </ul>
        <Button
          title={this.props.emotion ? 'View sentiment' : 'View emotion'}
          onClick={this.props.emotionClick} />
      </div>
    );
  }
}

Paramteres.propTypes = {
  searchtext: PropTypes.any,
  sentiment: PropTypes.any,
  timeinterval: PropTypes.any,
  amount: PropTypes.any,
  threshold: PropTypes.any,
  emotion: PropTypes.any,
  emotionClick: PropTypes.any,
};

export default Paramteres;
