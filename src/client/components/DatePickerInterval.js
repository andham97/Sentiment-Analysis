import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import './style/DatePickerInterval.css';
import Proptypes from 'prop-types';

class DatePickerInterval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: props.startDate,
      endDate: props.endDate,
    };
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.handleChangeStart = this.handleChangeStart.bind(this);
  }

  componentWillMount() {
    this.setState({
      startDate: this.props.startDate ? this.props.startDate : undefined,
      endDate: this.props.endDate ? this.props.endDate : undefined,
    });
  }

  handleChangeStart(start) {
    this.props.change({ startDate: start, endDate: this.state.endDate });
    this.setState({
      ...this.state,
      startDate: start,
    });
  }

  handleChangeEnd(end) {
    this.props.change({ startDate: this.state.startDate, endDate: end });
    this.setState({
      ...this.state,
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
           isClearable={true}
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
           isClearable={true}
        />
      </div>
    );
  }
}

DatePickerInterval.propTypes = {
  style: Proptypes.any,
  change: Proptypes.any,
  startDate: Proptypes.any,
  endDate: Proptypes.any,
};

export default DatePickerInterval;
