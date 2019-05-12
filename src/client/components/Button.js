import React, { Component } from 'react';
import './style/SearchButton.css';
import PropTypes from 'prop-types';

class Button extends Component {
  render() {
    return (
      <div>
          <button
            onClick={this.props.onClick}
            className={this.props.className}>
          {this.props.title}</button>
      </div>
    );
  }
}

Button.propTypes = {
  onClick: PropTypes.any,
  className: PropTypes.any,
  title: PropTypes.any,
};

export default Button;
