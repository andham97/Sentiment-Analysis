import React, { Component } from 'react';
import '../style/NewSearch.css';
import { FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import Alert from 'react-s-alert';
import DatePickerInterval from '../DatePickerInterval';
import Checkbox from '../Checkbox';
import SearchButton from '../Button';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import '../style/react_dates_overrides.css';
import { SearchContext } from './SearchStore';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Emotion checkbox
 * @type {Array<Object>}
 */
const checkboxesEmotions = [
  {
    name: 'analysis_filter_emotions',
    key: 'joy',
    value: 'Joy',
  },
  {
    name: 'analysis_filter_emotions',
    key: 'anger',
    value: 'Anger',
  },
  {
    name: 'analysis_filter_emotions',
    key: 'disgust',
    value: 'Disgust',
  },
  {
    name: 'analysis_filter_emotions',
    key: 'sadness',
    value: 'Sadness',
  },
  {
    name: 'analysis_filter_emotions',
    key: 'fear',
    value: 'Fear',
  },
];

/**
 * @class
 * @extends Component
 *
 * @reactProps {Object} history
 */
class NewSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedItemsNews: [],
      checkedItemsEmotion: [],
      show: false,
      news_search: '',
      search: '',
      neutralThreshold: '0.2',
    };
    this.handleChangeCheckboxNews = this.handleChangeCheckboxNews.bind(this);
    this.handleChangeCheckboxEmotion = this.handleChangeCheckboxEmotion.bind(this);
    this.handleFilterClick = this.handleFilterClick.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  componentWillMount() {
    this.context.getSources();
  }

  /**
   * Update search text
   *
   * @function updateSearch
   * @param  {Object}     event
   */
  updateSearch(event) {
    this.setState({ news_search: event.target.value });
  }

  /**
   * Advanced filter
   *
   * @function handleFilterClick
   */
  handleFilterClick() {
    const { buttonclicked } = this.state;
    this.setState({ buttonclicked: !buttonclicked });
  }

  /**
   * Checkbox click
   *
   * @function handleChecked
   */
  handleChecked() {
    this.setState({
      show: !this.state.show,
      checkedItemsEmotion: [],
    });
  }

  /**
   * News checkbox click
   *
   * @function handleChangeCheckboxNews
   * @param  {Object}                 e
   */
  handleChangeCheckboxNews(e) {
    const item = e.target.value;
    const { checkedItemsNews } = this.state;
    if (checkedItemsNews.indexOf(item) > -1)
      checkedItemsNews.splice(checkedItemsNews.indexOf(item), 1);
    else
      checkedItemsNews.push(item);
    this.setState({
      ...this.state,
      checkedItemsNews,
    });
  }

  /**
   * Emotion checkbox click handle
   *
   * @function handleChangeCheckboxEmotion
   * @param  {Object}                    e
   */
  handleChangeCheckboxEmotion(e) {
    const item = e.target.value;
    const { checkedItemsEmotion } = this.state;
    if (checkedItemsEmotion.indexOf(item) > -1)
      checkedItemsEmotion.splice(checkedItemsEmotion.indexOf(item), 1);
    else
      checkedItemsEmotion.push(item);
    this.setState({
      ...this.state,
      checkedItemsEmotion,
    });
  }

  /**
   * Date change handler
   *
   * @function dateChange
   * @param  {Date}   startDate
   * @param  {Date}   endDate
   */
  dateChange(startDate, endDate) {
    this.setState({
      ...this.state,
      startDate,
      endDate,
    });
  }

  /**
   * Performes the search
   *
   * @function handleSearch
   * @param  {string}     searchdata
   */
  handleSearch(searchdata) {
    if (!searchdata.search || searchdata.search === '' || searchdata.search.split(' ').filter(elem => elem !== '').length === 0)
      return Alert.error('The provided search query is empty', {
        position: 'top',
        effect: 'stackslide',
      });
    searchdata.neutralThreshold = Number(searchdata.neutralThreshold);
    this.context.getSearch(searchdata);
    this.props.history.push('/result');
  }

  /**
   * Handle search update
   *
   * @function handleInput
   * @param  {Object}    event
   */
  handleInput(event) {
    this.setState({
      ...this.state,
      search: event.target.value,
    });
  }

  render() {
    const filterNews = this.context.sources.filter(
      item => item.value.toLowerCase().indexOf(this.state.news_search.toLowerCase()) !== -1,
    );
    const { buttonclicked } = this.state;
    const searchdata = this.state;
    return (
      <div className='content' >
        <div className='container_top'>
          <div className='title'>New Search</div>
        </div>
        <hr style = {{ margin: '0px', opacity: '0.2' }} />
        {!buttonclicked
          ? (<div className='container_main'>
          <div className='flexContainer input'>
            <input className='searchfield' type='text' placeholder='  Search...' onChange={this.handleInput} onKeyDown={(e) => {
              if (e.keyCode === 13)
                this.handleSearch(searchdata);
            }}></input>
          </div>
          <div className='flexContainer buttons'>
            <button className='add_filter' onClick={this.handleFilterClick}>Add filters</button>
            <SearchButton onClick={() => this.handleSearch(searchdata)} title='Search'/>
          </div>
        </div>)
          : (
            <div className='container_filter'>
              <div className = 'flexContainer input_filter'>
                <input className ='searchfield_filter' type='text' placeholder='  Search...' onChange={this.handleInput} onKeyDown={(e) => {
                  if (e.keyCode === 13)
                    this.handleSearch(searchdata);
                }}></input>
                <SearchButton onClick={() => this.handleSearch(searchdata)} title='Search' />
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
                    {!this.state.show ? <div>Neutral sentiment threshold: {`\xB1 ${this.state.neutralThreshold}`}<br />
                      <input
                        type='range'
                        min={0}
                        max={20}
                        value={this.state.neutralThreshold * 20}
                        onChange={(e) => {
                          this.setState({
                            ...this.state,
                            neutralThreshold: e.target.value / 20,
                          });
                        }} />
                      </div> : null}
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
                                id={item.key}
                                value={item.value}
                                checked={this.state.checkedItemsEmotion.indexOf(item.key) > -1}
                                onChange={e => this.handleChangeCheckboxEmotion(e)}
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
                        value={this.state.news_search}
                        onChange={this.updateSearch.bind(this)}
                        placeholder=' News Source...'
                      />
                      {filterNews.map(item => <Checkbox
                        key={item.key}
                        id={item.key}
                        value={item.value}
                        checked={this.state.checkedItemsNews.indexOf(item.key) > -1}
                        onChange={e => this.handleChangeCheckboxNews(e)}
                      />)}
                    </div>
                  </div>
                <div className='filter_time'>
                  <div className='title_Analysis'> Date Interval </div>
                  <DatePickerInterval change={dates => this.setState({
                    ...this.state,
                    ...dates,
                  })} style={'../style/DatePickerInterval.css'} />
                    <p>Choose from and to date</p>
                </div>
              </div>
            </div>
          )
        }
      </div>);
  }
}

NewSearch.propTypes = {
  history: PropTypes.any,
};

NewSearch.contextType = SearchContext;

export default withRouter(NewSearch);
