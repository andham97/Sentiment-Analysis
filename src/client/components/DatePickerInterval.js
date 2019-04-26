import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import './style/DatePickerInterval.css';

class DatePickerInterval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      endDate: new Date(),
    };
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.handleChangeStart = this.handleChangeStart.bind(this);
  }

  handleChangeStart(start) {
    this.setState({
      startDate: start,
    });
  }

  handleChangeEnd(end) {
    this.setState({
      endDate: end,
    });
  }

  render() {
    return (
      <div className='datepickerinterval'>
      From: <DatePicker
           selected={this.state.startDate}
           selectsStart
           startDate={this.state.startDate}
           endDate={this.state.endDate}
           onChange={this.handleChangeStart}
           className={'daterangestart'}
           style={this.props.style}
        />

        <br />

        To: <DatePicker
           selected={this.state.endDate}
           selectsEnd
           startDate={this.state.startDate}
           endDate={this.state.endDate}
           onChange={this.handleChangeEnd}
           className={'daterangeend'}
           style={this.props.style}
        />
      </div>
    );
  }
}

export default DatePickerInterval;
