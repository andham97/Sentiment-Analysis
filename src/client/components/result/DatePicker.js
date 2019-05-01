import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import '../style/DatePicker.css';

class Datepicker extends Component {
  render() {
    return (
      <div><br /> <span className='chooseDate'>Choose prefered date: </span>
        <DatePicker todayButton={'Today'} selected={this.props.startDate} onChange={this.props.handleChange}/>
      </div>
    );
  }
}

export default Datepicker;
