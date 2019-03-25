import React, { Component } from 'react';
import './style/Header.css';
import PropTypes from 'prop-types';

class Header extends Component {
  render() {
    const { name } = this.props;
    return (
      <div className="header">
        <div>{ name }</div>
      </div>
    );
  }
}

Header.propTypes = {
  name: PropTypes.any,
};

export default Header;
