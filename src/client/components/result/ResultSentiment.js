import React, { Component } from 'react';
import '../style/ResultSentiment.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import stt from 'search-text-tokenizer';
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

const colornegative = '#FF5C54';
const colorneutral = '#AFBE8F';
const colorpositive = '#5EA3DB';

class ResultSentiment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      averageArray: [],
      checkedSentiment: [],
    };
    this.handleCheckedSentiment = this.handleCheckedSentiment.bind(this);
  }

  makeRedirect(url) {
    if (typeof url !== 'undefined') {
      window.open(url, '_blank');
    }
  }

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

  dateChange(date) {
    const opts = JSON.parse(JSON.stringify(this.context.searchOpts));
    let { startDate, endDate } = date || this.state;
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
    opts.startDate = startDate;
    opts.endDate = endDate;
    this.context.computeSearch(this.context.search, opts);
    this.setState({
      ...this.state,
      startDate,
      endDate,
    });
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
    filterSentiment = (startDate || endDate)
      ? filterSentiment.filter(doc => (startDate ? doc.date >= startDate : true)
        && (endDate ? doc.date <= endDate : true)) : filterSentiment;
    filterSentiment = filterSentiment.filter(item => item.analysis.sentiment);
    return (
      <React.Fragment>
        <Header class='resultSentiment_header' name='Sentiment Analysis' />
        <div className='resultSentiment'>
          <div className='resultSentiment_filter'>
              <div className= 'filterSentiment_bar'>
                <div>
                  <Dropdown titleList='Sentiment' items={
                    this.context.graphData.map((item, i) => <Checkbox
                      key={i}
                      id={item.title}
                      value={item.title[0].toUpperCase() + item.title.slice(1)}
                      checked={this.state.checkedSentiment.indexOf(item.title) > -1}
                      onChange={sentiment => this.handleCheckedSentiment(sentiment)}
                    />)
                  } />
                  <Dropdown titleList='Date Interval' items={<DatePickerInterval change={(date) => {
                    this.setState({
                      ...this.state,
                      ...date,
                    });
                    this.dateChange(date);
                  }} startDate={this.state.startDate ? new Date(this.state.startDate) : undefined}
                  endDate={this.state.endDate ? new Date(this.state.endDate) : undefined} />} />
                </div>
                <div>
                  <Button className='exportpdf' title='Export PDF' onClick={() => {

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
                  timeinterval={`Date Interval: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`}
                  threshold={`Neutral threshold: \xB1 ${this.context.searchOpts.neutralThreshold}`}
                  amount={`Amount: ${filterSentiment.length}`}
                />
              </div>
            </Card>
          </div>

          {this.context.graphData.map((element, i) => {
            const name = className(element.title);
            return (<div key={i} className = {`resultSentiment_graphs_${name}`}>
              <Card>
                <div align='center' className='graphs' >
                  <DonutChart chart={`${name}_chart`} label={`label_${name}`} name={element.title} data={[element]}/>
                </div>
              </Card>
            </div>);
          })}

          <div className='resultSentiment_emotionalTone'>
            <Card>
            <div className='emotionalTone'>Emotional Tone </div>
              <LineChart
                width={350}
                height={300}
                data={this.context.emotionalTone}
                margin={{
                  top: 20,
                }} onClick={(data) => {
                  if (data
                    && data.activePayload
                    && data.activePayload[0]
                    && data.activePayload[0].payload
                    && data.activePayload[0].payload.time)
                    this.dateChange({
                      startDate: new Date(data.activePayload[0].payload.time),
                      endDate: new Date(data.activePayload[0].payload.time),
                    });
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
            { filterSentiment.map((item, i) => <NewsArticleSentiment
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
