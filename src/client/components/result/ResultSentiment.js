import React, { Component } from 'react';
import '../style/ResultSentiment.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import stt from 'search-text-tokenizer';
import Alert from 'react-s-alert';
import Header from '../Header';
import Dropdown from '../Dropdown';
import DatePickerInterval from '../DatePickerInterval';
import Button from '../Button';
import Parameteres from './Parameters';
import Card from '../Card';
import Checkbox from '../Checkbox';
import DonutChart from './graph/DonutChart';
import { SearchContext } from '../dashboard/SearchStore';
import NewsArticleSentiment from './NewsArticleSentiment';

/**
 * Class to name
 *
 * @function className
 * @param  {string}  name
 * @returns {string}
 */
const className = (name) => {
  switch (name) {
    case 'negative':
      return 'negative';
    case 'neutral':
      return 'neutral';
    case 'positive':
      return 'positive';
    default:
      return [];
  }
};

/**
 * Negative color
 * @type {String}
 */
const colornegative = '#FF5C54';

/**
 * Neutral color
 * @type {String}
 */
const colorneutral = '#AFBE8F';

/**
 * Positive color
 * @type {String}
 */
const colorpositive = '#5EA3DB';

/**
 * @class ResultSentiment
 * @extends Component
 */
class ResultSentiment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      averageArray: [],
      checkedSentiment: [],
      etSelection: false,
    };
    this.handleCheckedSentiment = this.handleCheckedSentiment.bind(this);
  }

  /**
   * Redirect to rul
   *
   * @function makeRedirect
   * @param  {string}     url - [description]
   */
  makeRedirect(url) {
    if (typeof url !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  /**
   * Handle sentiment checkbox
   *
   * @function handleCheckedSentiment
   * @param  {Object}               sentiment
   */
  handleCheckedSentiment(sentiment) {
    const item = sentiment.target.value;
    const isChecked = sentiment.target.checked;
    const cs = this.state.checkedSentiment;
    if (isChecked && cs.indexOf(item) === -1)
      cs.push(item);
    else if (!isChecked && cs.indexOf(item) > -1)
      cs.splice(cs.indexOf(item), 1);
    this.setState({ ...this.state, checkedSentiment: cs });
  }

  /**
   * Date change
   *
   * @function dateChange
   * @param  {Date}   date
   */
  dateChange(date) {
    const opts = JSON.parse(JSON.stringify(this.context.searchOpts));
    let startDate = !date || !date.startDate ? this.state.startDate : date.startDate;
    let endDate = !date || !date.endDate ? this.state.endDate : date.endDate;
    if (!date) {
      startDate = new Date(0);
      endDate = new Date();
    }
    if (!startDate)
      startDate = this.context.searchOpts.startDate;
    if (!endDate)
      endDate = this.context.searchOpts.endDate;
    if (!startDate.getTime)
      startDate = new Date(startDate);
    if (!endDate.getTime)
      endDate = new Date(endDate);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    startDate = startDate.getTime();
    endDate = endDate.getTime();
    if (date.startDate && this.context.search.docs[this.context.search.docs.length - 1]
      .date - (24 * 60 * 60 * 1000) > startDate && this.state.startDate)
      Alert.warning('Provided "from" date is outside current search results', { position: 'top' });
    else if (date.endDate && this.context.search.docs[0]
      .date + (24 * 60 * 60 * 1000) < endDate && this.state.endDate)
      Alert.warning('Provided "to" date is outside current search results', { position: 'top' });
    opts.startDate = startDate;
    opts.endDate = endDate;
    this.context.computeSearch(this.context.search, opts);
  }

  render() {
    let { startDate, endDate } = this.state;
    if (!startDate)
      startDate = this.context.searchOpts.startDate;
    if (!endDate)
      endDate = this.context.searchOpts.endDate;
    if (startDate.getTime)
      startDate = startDate.getTime();
    if (endDate.getTime)
      endDate = endDate.getTime();
    let filterSentiment = (this.state.checkedSentiment.length === 0
      ? this.context.search.docs : this.context.search.docs
        .filter(doc => (this.state.checkedSentiment.indexOf(doc.analysis.sentiment.label) > -1)));
    filterSentiment = ((startDate || endDate)
      ? filterSentiment.filter(doc => (startDate ? doc.date >= startDate : true)
        && (endDate ? doc.date <= endDate : true)) : filterSentiment)
      .filter(item => item.analysis.sentiment);
    return (
      <React.Fragment>
        <Header class='resultSentiment_header' name='Sentiment Analysis' />
        <div className='resultSentiment'>
          <div className='resultSentiment_filter'>
              <div className= 'filterSentiment_bar'>
                <div>
                  <Dropdown className='clickable' titleList='Sentiment' items={
                    this.context.graphData.map((item, i) => <Checkbox
                      key={i}
                      id={item.title}
                      value={item.title[0].toUpperCase() + item.title.slice(1)}
                      checked={this.state.checkedSentiment.indexOf(item.title) > -1}
                      onChange={sentiment => this.handleCheckedSentiment(sentiment)}
                    />)
                  } />
                  <Dropdown className='clickable' titleList='Date Interval' items={<DatePickerInterval change={(date) => {
                    this.setState({
                      ...this.state,
                      etSelection: false,
                      startDate: date.startDate === null ? undefined : date.startDate,
                      endDate: date.endDate === null ? undefined : date.endDate,
                    });
                    this.dateChange({
                      startDate: date.startDate === null
                        ? this.context.search.docs[this.context.search.docs.length - 1].date
                        : date.startDate,
                      endDate: date.endDate === null
                        ? this.context.search.docs[0].date
                        : date.endDate,
                    });
                  }} startDate={this.state.startDate ? new Date(this.state.startDate) : undefined}
                  endDate={this.state.endDate ? new Date(this.state.endDate) : undefined} />} />
                  <Dropdown className='clickable' titleList='Neutral threshold' items={<div>Neutral sentiment threshold: {`\xB1 ${this.state.neutralThreshold && this.state.neutralThreshold !== 0 ? this.state.neutralThreshold : this.context.searchOpts.neutralThreshold}`}<br />
                    <input
                      type='range'
                      min={0}
                      max={20}
                      value={(this.state.neutralThreshold && this.state.neutralThreshold !== 0
                        ? this.state.neutralThreshold
                        : this.context.searchOpts.neutralThreshold) * 20}
                      onChange={(e) => {
                        this.setState({
                          ...this.state,
                          neutralThreshold: Number(e.target.value / 20),
                        });
                      }} />
                    <Button title='Apply' onClick={() => {
                      if ((!this.state.neutralThreshold && this.state.neutralThreshold !== 0)
                        || this.state.neutralThreshold === this.context.searchOpts.neutralThreshold)
                        return;
                      const opts = JSON.parse(JSON.stringify(this.context.searchOpts));
                      opts.neutralThreshold = Number(this.state.neutralThreshold);
                      this.context.computeSearch(this.context.search, opts);
                    }} />
                    </div>} />
                </div>
                <div>
                  <Button className='exportpdf' title='Print result' onClick={() => {
                    window.print();
                  }} />
                </div>
            </div>
          </div>

          <div className = 'resultSentiment_parameters'>
            <Card>
              <div className='title_param'>Parameters</div>
              <div className='param_card'>
                <Parameteres
                  searchtext={stt(this.context.searchOpts.search.replace(/[^a-zA-Z\s-]/g, ''))
                    .reduce((acc, val) => {
                      if (acc !== '')
                        acc += ', ';
                      if (val.exclude)
                        acc += `-${val.term}`;
                      else if (val.phrase)
                        acc += `"${val.term}"`;
                      else
                        acc += val.term;
                      return acc;
                    }, '')}
                  sentiment={`Sentiment: ${this.state.checkedSentiment.length === 0
                    ? 'Positive, Neagtive, Neutral'
                    : `${this.state.checkedSentiment.slice(0, -1)
                      .map(s => s[0].toUpperCase() + s.slice(1)).join(', ')}${this.state.checkedSentiment.slice(0, -1).length > 0
                      ? ', '
                      : ''}${this.state.checkedSentiment.slice(-1).map(s => s[0].toUpperCase() + s.slice(1))[0]}`}`}
                  timeinterval={`Date Interval: ${new Date(this.state.startDate ? this.state.startDate : filterSentiment[filterSentiment.length - 1].date).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`}
                  threshold={`Neutral threshold: \xB1 ${this.context.searchOpts.neutralThreshold}`}
                  amount={`Amount: ${filterSentiment.length}`}
                  emotion={this.context.searchOpts.show}
                  emotionClick={() => {
                    const opts = JSON.parse(JSON.stringify(this.context.searchOpts));
                    opts.show = !opts.show;
                    this.context.computeSearch(this.context.search, opts);
                  }}
                />
              </div>
            </Card>
          </div>

          {this.context.graphData.map((element, i) => {
            const name = className(element.title);
            return (<div key={i} className = {`resultSentiment_graphs_${name} clickable clickable-color`}>
              <Card onClick={() => {
                if (this.state.checkedSentiment[0] === name
                  && this.state.checkedSentiment.length === 1)
                  return this.setState({ ...this.state, checkedSentiment: [] });
                this.setState({
                  ...this.state,
                  checkedSentiment: [name],
                });
              }}>
                <div align='center' className='graphs' >
                  <DonutChart chart={`${name}_chart`} label={`label_${name}`} name={element.title} data={[element]}/>
                </div>
              </Card>
            </div>);
          })}

          <div className='resultSentiment_emotionalTone'>
            <Card>
            <div className='emotionalTone'>Emotional Tone</div>
              <LineChart
                className='clickable'
                width={350}
                height={300}
                data={this.context.emotionalTone}
                margin={{
                  top: 20,
                }} onClick={(data) => {
                  if (this.state.etSelection) {
                    this.setState({
                      ...this.state,
                      etSelection: false,
                      startDate: undefined,
                      endDate: undefined,
                    });
                    this.dateChange();
                  }
                  else if (data
                    && data.activePayload
                    && data.activePayload[0]
                    && data.activePayload[0].payload
                    && data.activePayload[0].payload.time) {
                    const sd = new Date(data.activePayload[0].payload.time);
                    const ed = new Date(data.activePayload[0].payload.time);
                    sd.setHours(0);
                    sd.setMinutes(0);
                    sd.setSeconds(0);
                    ed.setHours(23);
                    ed.setMinutes(59);
                    ed.setSeconds(59);
                    this.setState({
                      ...this.state,
                      etSelection: true,
                      startDate: sd,
                      endDate: ed,
                    });
                    this.dateChange({
                      startDate: sd,
                      endDate: ed,
                    });
                  }
                }}>
                <XAxis dataKey="date"/>
                <YAxis/>
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" name="Negative" dataKey="sentiments.negative.score" stroke={colornegative} activeDot={{ r: 8 }}/>
                <Line type="monotone" name="Neutral" dataKey="sentiments.neutral.score" stroke={colorneutral} />
                <Line type="monotone" name="Positive" dataKey="sentiments.positive.score" stroke={colorpositive} />
              </LineChart>
            </Card>
          </div>

          <div className='resultSentiment_articles'>
            <Card>
              { filterSentiment.length === 0 ? 'No articles found with provided filters' : filterSentiment.map((item, i) => <NewsArticleSentiment
                key={i}
                date={new Date(item.date).toLocaleDateString()}
                title={item.headline}
                newssource={item.sourceID}
                domSentiment={item.analysis.sentiment.label}
                onClick= {() => this.makeRedirect(item.url)}
                sentiments= {item.analysis.sentiment ? item.analysis.sentiment : {
                  negative: 0, neutral: 0, positive: 0,
                }}
              />)}
            </Card>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

ResultSentiment.contextType = SearchContext;

export default ResultSentiment;
