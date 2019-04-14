import React, { Component } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import Card from '../Card';
import Header from '../Header';
import DonutChart from './graph/DonutChart';
import Parameteres from './Parameters';
import '../style/Result.css';
import Exportpdf from './ExportPDF';
import NewsArticle from './NewsArticle';
import Dropdown from '../Dropdown';
import Datepicker from './DatePicker';
import Checkbox from '../Checkbox';
import { SearchContext } from '../dashboard/SearchStore';

const classNameMap = (name) => {
  switch (name) {
    case 'anger':
      return 'anger';
    case 'sadness':
      return 'sadness';
    case 'fear':
      return 'fear';
    case 'joy':
      return 'joy';
    case 'disgust':
      return 'disgust';
    default:
      return [];
  }
};

const coloranger = '#E26D5A';
const colorfear = '#3A405A';
const colorjoy = '#D3C0CD';
const colorsad = '#3D70B2';
const colordisgust = '#9FAF90';

class Result extends Component {
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
    return (
      <React.Fragment>
        <Header class='result_header' name='Sentiment Analysis' />
        <div className = 'result'>
          <div className = 'result_filter'>
              <div className= 'filter_bar'>
                <div className='test'>
                  <Dropdown titleList='Date' items={ <Datepicker /> }/>
                  <Dropdown titleList='Emotion' items={
                    this.context.graphData.map((item, i) => <Checkbox
                        key={i}
                        value={item.title}
                      />)
                  } />
                  <Dropdown titleList='Time Interval' items={
                    this.context.graphData.map((item, i) => <ul key={i}>{item.title}</ul>)
                  } />
                </div>
                <div>
                  <Exportpdf className='exportpdf'/>
                </div>
              </div>
          </div>

          <div className = 'result_parameters'>
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
              const name = classNameMap(element.title);
              return (<div key={i} className = {`result_graphs_${name}`}>
                <Card>
                  <div className='graphs' style={{ margin: '20px' }} >
                    <DonutChart chart={`${name}_chart`} label={`label_${name}`} name={element.title} data={[element]}/>
                  </div>
                </Card>
              </div>);
            })}

          <div className = 'result_graph'>
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
                <Line type="monotone" name="Anger" dataKey="emotions.anger.perc" stroke={coloranger} activeDot={{ r: 8 }}/>
                <Line type="monotone" name="Joy" dataKey="emotions.joy.perc" stroke={colorjoy} />
                <Line type="monotone" name="Fear" dataKey="emotions.fear.perc" stroke={colorfear} />
                <Line type="monotone" name="Sadness" dataKey="emotions.sadness.perc" stroke={colorsad} />
                <Line type="monotone" name="Disgust" dataKey="emotions.disgust.perc" stroke={colordisgust} />
              </LineChart>
            </Card>
          </div>

          <div className = 'result_news'>
            <Card>
            { this.context.search.docs.map((article, i) => {
              if (!article)
                return '';
              let analysis = {};
              if (article.analysis)
                analysis = article.analysis;
              return (
                <NewsArticle
                  key={i}
                  date={new Date(article.date).toLocaleDateString()} // ER HARD KODET
                  title={article.headline}
                  newssource={article.sourceID}
                  domFeeling={analysis.emotion ? Object.keys(analysis.emotion)
                    .sort((a, b) => analysis.emotion[b] - analysis.emotion[a])[0] : 'None'}
                  feelings= {analysis.emotion ? analysis.emotion : {
                    anger: 0, joy: 0, disgust: 0, fear: 0, sadness: 0,
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

Result.contextType = SearchContext;

export default Result;
