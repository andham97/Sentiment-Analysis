import React, { Component } from 'react';
import '../style/ResultSentiment.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import Header from '../Header';
import Dropdown from '../Dropdown';
// import Checkbox from '../Checkbox';
import DatePickerInterval from '../DatePickerInterval';
import Datepicker from './DatePicker';
import Exportpdf from './ExportPDF';
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
      startDate: new Date(),
    };
    this.handleCheckedSentiment = this.handleCheckedSentiment.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    if (!this.context.search && localStorage.getItem('prev-search'))
      this.context.getSearch(localStorage.getItem('prev-search'));
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
    if (isChecked)
      cs.push(item);
    else
      cs.splice(cs.indexOf(item), 1);
    this.setState({ ...this.state, checkedSentiment: cs });
  }

  handleChange(date) {
    this.setState({
      startDate: date,
    });
  }

  render() {
    console.log(this.state.startDate);
    const sentimentSearch = this.context.search.docs;
    const filterSentiment = this.state.checkedSentiment.length === 0
      ? sentimentSearch : sentimentSearch.filter(
        item => this.state.checkedSentiment.indexOf(item.analysis.sentiment.label) > -1,
        // && this.state.startDate === item.date,
      );
    return (
      <React.Fragment>
        <Header class='resultSentiment_header' name='Sentiment Analysis' />
        <div className='resultSentiment'>
          <div className='resultSentiment_filter'>
              <div className= 'filterSentiment_bar'>
                <div className='test'>
                  <Dropdown titleList='Date' items={ <Datepicker startDate={this.state.startDate} onChange={this.handleChange} /> }/>
                  <Dropdown titleList='Sentiment' items={
                    this.context.graphData.map((item, i) => <Checkbox
                        key={i}
                        value={item.title}
                        onChange={sentiment => this.handleCheckedSentiment(sentiment)}
                      />)
                  } />
                  <Dropdown titleList='Time Interval' items={<DatePickerInterval />} />
                </div>
                <div>
                  <Exportpdf className='exportpdf'/>
                </div>
            </div>
          </div>

          <div className = 'resultSentiment_parameters'>
            <Card>
              <div className='title_param'>Parameters</div>
              <div className='param_card'>
                <Parameteres
                  searchtext={this.context.searchOpts.search}
                  sentiment='Sentiment: Positive, Neagtive, Neutral'
                  date='Date: 23.05.19'
                  timeinterval='Time Interval: 23.05.19-25.05.19'
                  amount='Amount: 1000'
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
