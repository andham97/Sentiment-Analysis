import React, { Component } from 'react';
import './style/Header.css';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

class Header extends Component {
  render() {
    const { name, children } = this.props;
    return (
      <div className="header">
        <div><span onClick={() => this.props.history.push('/')}>{ name }</span> { children }</div>
      </div>
    );
  }
}

Header.propTypes = {
  name: PropTypes.any,
  children: PropTypes.any,
  history: PropTypes.any,
};

export default withRouter(Header);
