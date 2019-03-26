import React, { Component } from 'react';
import './style/NewSearch.css';
import { FaTimes } from 'react-icons/fa';
import { DateRangePicker } from 'react-dates';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { checkboxesNews } from './checkboxes_news';
import checkboxesEmotions from './checkboxes_emotions';
import Checkbox from './Checkbox';
import SearchButton from './SearchButton';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import './style/react_dates_overrides.css';

import 'react-datepicker/dist/react-datepicker.css';


class NewSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      checkedItems: new Map(),
      startDate: moment(),
      endDate: moment(),
      search: '',
    };
    this.handleFilterClick = this.handleFilterClick.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.handleChangeCheckbox = this.handleChangeCheckbox.bind(this);
  }

  updateSearch(event) {
    this.setState({ search: event.target.value });
  }

  handleFilterClick() {
    const { buttonclicked } = this.state;
    this.setState({ buttonclicked: !buttonclicked });
  }

  handleChecked() {
    this.setState({
      show: !this.state.show,
    });
  }

  handleChangeCheckbox(e) {
    const item = e.target.value;
    const isChecked = e.target.checked;
    this.setState(prevState => ({ checkedItems: prevState.checkedItems.set(item, isChecked) }));
  }

  dateChange(startDate, endDate) {
    this.setState({
      startDate,
      endDate,
    });
  }

  handleSearch(history) {
    history.push('/result');
  }


  render() {
    const filterNews = checkboxesNews.filter(
      item => item.value.toLowerCase().indexOf(
        this.state.search.toLowerCase(),
      ) !== -1,
    );
    const { buttonclicked } = this.state;
    const { history } = this.props;

    return (
      <div className='content' >
        <div className='container_top'>
          <div className='title'>New Search</div>
        </div>
        <hr style = {{ margin: '0px', opacity: '0.2' }} />
        {!buttonclicked
          ? (<div className='container_main'>
          <div className='flexContainer input'>
            <input className='searchfield' type='text' placeholder='  Search...' ></input>
          </div>
          <div className='flexContainer buttons'>
            <button className='add_filter' onClick={this.handleFilterClick}>Add filters</button>
            <SearchButton onClick={() => this.handleSearch(history)}/>
          </div>
        </div>)
          : (
            <div className='container_filter'>
              <div className = 'flexContainer input_filter'>
                <input className ='searchfield_filter' type='text' placeholder='  Search...'></input>
                <SearchButton onClick={() => this.handleSearch(history)} />
              </div>
                <hr style = {{ margin: '0px', opacity: '0.2' }} />
                <div className = 'exit_filter' onClick={this.handleFilterClick}> <FaTimes /> </div>
              <div id='filter' className='flexContainer apply_filter'>
                <div className='filter_analysis'>
                  <div className='title_Analysis'> Analysis </div>
                  <form>
                    <div className='analysis-check'>
                      <label>
                        <input
                          type='radio'
                          name='analysis_filter'
                          value='sentiment'
                          className='analysis-check-input'
                          checked={this.state.show === false}
                          onChange={() => this.handleChecked()}
                        />
                         Sentiment
                      </label>
                    </div>
                    <div className='analysis-check'>
                    <div className='checkbox'>
                      <label>
                        <input
                          type='radio'
                          name='analysis_filter'
                          value='emotion'
                          className='analysis-check-input'
                          checked={this.state.show === true}
                          onChange={() => this.handleChecked()}
                        />
                         Emotion
                      </label>
                      <br />
                      <div className='analysis-check-input-checkbox'>
                        {
                        this.state.show
                          ? checkboxesEmotions.map(item => (
                            <div key={item.key}>
                              <Checkbox
                                value={item.value}
                                checked={this.state.checkedItems.get(item.value) || false}
                                onChange={e => this.handleChangeCheckbox(e)}
                                className='checkbox_emotion'
                                name='emotion'
                              />
                            </div>
                          ))
                          : null
                        }
                      </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div className='filter_source'>
                  <div className='title_Analysis'> News Source </div>
                    <div>
                      <input type='text'
                        className='searchNews'
                        value={this.state.search}
                        onChange={this.updateSearch.bind(this)}
                        placeholder=' News Source...'
                      />
                        {
                          filterNews.map(item => <Checkbox
                              key={item.key}
                              value={item.value}
                              checked={this.state.checkedItems.get(item.value) || false}
                              onChange={e => this.handleChangeCheckbox(e)}
                            />)
                        }
                    </div>
                  </div>
                <div className='filter_time'>
                  <div className='title_Analysis'> Time Interval </div>
                   <DateRangePicker
                      startDate={this.state.startDate}
                      startDateId="your_unique_start_date_id"
                      endDate={this.state.endDate}
                      endDateId="your_unique_end_date_id"
                      onDatesChange={({
                        startDate,
                        endDate,
                      }) => this.setState({
                        startDate,
                        endDate,
                      })}
                      focusedInput={this.state.focusedInput}
                      onFocusChange={focusedInput => this.setState({ focusedInput })}
                    />
                    <p>Choose from and to date</p>
                </div>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

NewSearch.propTypes = {
  checkboxesNews: PropTypes.any,
  history: PropTypes.any,
};

export default withRouter(NewSearch);
