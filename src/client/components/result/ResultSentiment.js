import React, { Component } from 'react';
import '../style/ResultSentiment.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import Header from '../Header';
import Dropdown from '../Dropdown';
// import Checkbox from '../Checkbox';
import Datepicker from './DatePicker';
import Exportpdf from './ExportPDF';
import Parameteres from './Parameters';
import Card from '../Card';
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
    };
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

  render() {
    if (!this.context.search) {
      return 'Loading';
    }
    const colors = ['#5EA3DB', '#FF5C54', '#AFBE8F'];
    this.context.getEmotionalTone();
    let search = {};
    if (this.context && this.context.search)
      search = this.context.search;
    if (!search.docs)
      search.docs = [];
    const average = search.docs.reduce((acc, val) => {
      let sentiment = val.analysis.sentiment;
      console.log(sentiment);
      if (!sentiment) {
        sentiment = {
          score: 0,
          label: 'neutral',
        };
      }
      acc.sentiment[val.analysis.sentiment.label]++;
      return acc;
    }, {
      sentiment: { positive: 0, negative: 0, neutral: 0 },
    });

    Object.keys(average).forEach((key) => {
      if (typeof average[key] === 'number')
        average[key] /= search.docs.length;
      else
        Object.keys(average[key]).forEach((key2) => {
          average[key][key2] /= search.docs.length;
        });
    });
    const data = Object.keys(average.sentiment ? average.sentiment : {}).map(
      (key, i) => (
        {
          title: key,
          value: Math.floor(average.sentiment[key] * 100),
          color: colors[i],
        }),
    );

    return (
      <React.Fragment>
        <Header class='resultSentiment_header' name='Sentiment Analysis' />
        <div className='resultSentiment'>
          <div className='resultSentiment_filter'>
              <div className= 'filterSentiment_bar'>
                <div className='test'>
                  <Dropdown titleList='Date' items={ <Datepicker /> }/>
                  <Dropdown titleList='Emotion' items={'test'} />
                  <Dropdown titleList='Time Interval' items={'test'} />
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
                  searchtext={this.context.searchword}
                  sentiment='Sentiment: Positive, Neagtive, Neutral'
                  date='Date: 23.05.19'
                  timeinterval='Time Interval: 23.05.19-25.05.19'
                  amount='Amount: 1000'
                />
              </div>
            </Card>
          </div>

          {data.map((element, i) => {
            const name = className(element.title);
            return (<div key={i} className = {`resultSentiment_graphs_${name}`}>
              <Card>
                <div className='graphs' style={{ marginLeft: '70px', marginRight: '70px' }} >
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
                data={this.context.getEmotionalToneSentiment()}
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
          { search.docs.map((article, i) => {
            if (!article)
              return '';
            let analysis = {};
            if (article.analysis)
              analysis = article.analysis;
            return (
              <NewsArticleSentiment
                key={i}
                date={new Date(article.date).toLocaleDateString()} // ER HARD KODET
                title={article.headline}
                newssource={article.sourceID}
                domSentiment={analysis.sentiment.label}
                sentiments= {analysis.sentiment ? analysis.sentiment : {
                  negative: 0, neutral: 0, positive: 0,
                }}
                onClick= {() => this.makeRedirect(article.url)}
              />
            );
          }) }
          </Card>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

ResultSentiment.contextType = SearchContext;


export default ResultSentiment;