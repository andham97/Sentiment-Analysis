import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import './style/DatePickerInterval.css';
import Proptypes from 'prop-types';

/**
 * @class DatePickerInterval
 * @extends Component
 *
 * @reactProps {String} style
 * @reactProps {Function} change
 * @reactProps {Date} startDate
 * @reactProps {Date} endDate
 */
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

  /**
   * Start date change
   *
   * @function handleChangeStart
   * @param  {Date}          start
   */
  handleChangeStart(start) {
    if (start && start.getTime) {
      start.setHours(0);
      start.setMinutes(0);
      start.setSeconds(0);
    }
    this.props.change({ startDate: start, endDate: this.state.endDate });
    this.setState({
      ...this.state,
      startDate: start,
    });
  }

  /**
   * End date change
   *
   * @function handleChangeEnd
   * @param  {Date}        end
   */
  handleChangeEnd(end) {
    if (end && end.getTime) {
      end.setHours(23);
      end.setMinutes(59);
      end.setSeconds(59);
    }
    this.props.change({ startDate: this.state.startDate, endDate: end });
    this.setState({
      ...this.state,
      endDate: end,
    });
  }

  render() {
    return (
      <div className='datepickerinterval'>
        From: <br /><DatePicker
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

        To: <br /><DatePicker
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
