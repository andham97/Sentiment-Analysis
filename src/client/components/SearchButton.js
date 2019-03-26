import React, { Component } from 'react';
import './style/SearchButton.css';
import PropTypes from 'prop-types';

class SearchButton extends Component {
  render() {
    return (
      <div>
          <button onClick={this.props.onClick} className='search'>Search</button>
      </div>
    );
  }
}

SearchButton.propTypes = {
  onClick: PropTypes.any,
};

export default SearchButton;
