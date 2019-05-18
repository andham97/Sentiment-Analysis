import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import './style/TimeInterval.css';

/**
 * @class TimeInterval
 * @extends Component
 */
class TimeInterval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      endDate: new Date(),
    };
    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * Handle date change
   *
   * @function handleChange
   * @param  {Date}     startdate
   * @param  {Date}     enddate
   */
  handleChange(startdate, enddate) {
    this.setState({
      startDate: startdate,
      endDate: enddate,
    });
  }

  render() {
    return (
      <div><br /> <span className='chooseDate'>Choose prefered date: </span>
        From: <DatePicker todayButton={'Today'} selected={this.state.startDate} onChange={this.handleChange()}/>
        To: <DatePicker todayButton={'Today'} selected={this.state.endDate} onChange={this.handleChange()}/>
      </div>
    );
  }
}

export default TimeInterval;
