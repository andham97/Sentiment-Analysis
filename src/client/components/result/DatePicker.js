import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import '../style/DatePicker.css';

class Datepicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(start) {
    this.setState({
      startDate: start,
    });
  }

  render() {
    return (
      <div><br /> <span className='chooseDate'>Choose prefered date: </span>
        <DatePicker todayButton={'Today'} selected={this.state.startDate} onChange={this.handleChange}/>
      </div>
    );
  }
}

export default Datepicker;
