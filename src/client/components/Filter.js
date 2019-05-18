import React, { Component } from 'react';
import './style/Filter.css';
import Proptypes from 'prop-types';
import { FaAngleDown } from 'react-icons/fa';

/**
 * @class Filter
 * @extends Component
 *
 * @reactProps {String} name
 */
class Filter extends Component {
  render() {
    const { name } = this.props;
    return (
      <div className='filter'>
        <div className='filter_name'> { name }</div>
        <span className='arrowDown'> <FaAngleDown /> </span>
      </div>
    );
  }
}

Filter.propTypes = {
  name: Proptypes.any,
};

export default Filter;
