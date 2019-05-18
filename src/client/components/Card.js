import React, { Component } from 'react';
import './style/Card.css';
import PropTypes from 'prop-types';

/**
 * @class Card
 * @extends Component
 *
 * @reactProps {String} style
 * @reactProps {Object} children
 * @reactProps {String} cName
 * @reactProps {Function} onClick
 */
class Card extends Component {
  render() {
    return (
      <div onClick={this.props.onClick} className={`card ${this.props.cName ? this.props.cName : ''}`} style={this.props.style}>{this.props.children}</div>
    );
  }
}

Card.propTypes = {
  style: PropTypes.any,
  children: PropTypes.any,
  cName: PropTypes.any,
  onClick: PropTypes.any,
};

export default Card;
