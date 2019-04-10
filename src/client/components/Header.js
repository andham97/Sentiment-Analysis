import React, { Component } from 'react';
import './style/Header.css';
import PropTypes from 'prop-types';

class Header extends Component {
  render() {
    const { name, children } = this.props;
    return (
      <div className="header">
        <div>{ name } { children }</div>
      </div>
    );
  }
}

Header.propTypes = {
  name: PropTypes.any,
  children: PropTypes.any,
};

export default Header;
