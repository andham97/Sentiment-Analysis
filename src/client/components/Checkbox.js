import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style/Checkbox.css';

class Checkbox extends Component {
  render() {
    const {
      name, id, value, className, onChange, checked,
    } = this.props;
    return (
      <div className='each_Checkbox'>
        <input type='checkbox' key= { id } name= { name } value= { value } checked= {checked} className= { className } onChange= { onChange }/> { value }
      </div>
    );
  }
}

Checkbox.propTypes = {
  name: PropTypes.any,
  id: PropTypes.any,
  value: PropTypes.any,
  className: PropTypes.any,
  onChange: PropTypes.any,
  checked: PropTypes.any,
};

export default Checkbox;
