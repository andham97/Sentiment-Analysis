import React, { Component } from 'react';
import './style/Card.css';
import PropTypes from 'prop-types';

class Card extends Component {
  render() {
    return (
      <div className = "card" style={this.props.style}>{this.props.children}</div>
    );
  }
}

Card.propTypes = {
  style: PropTypes.any,
  children: PropTypes.any,
};

export default Card;
