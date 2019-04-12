import React, { Component } from 'react';
import './style/Card.css';
import PropTypes from 'prop-types';

class Card extends Component {
  render() {
    console.log(this.props.cName);
    return (
      <div className={`card ${this.props.cName}`} style={this.props.style}>{this.props.children}</div>
    );
  }
}

Card.propTypes = {
  style: PropTypes.any,
  children: PropTypes.any,
  cName: PropTypes.any,
};

export default Card;
