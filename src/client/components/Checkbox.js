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
        <ul style= {{ margin: '0rem', paddingLeft: '0.2rem' }}><input type='checkbox' key= { id } name= { name } value= { value } checked= {checked} className= { className } onChange= { onChange }/> { value }</ ul>
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
