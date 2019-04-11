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

  makeRedirect(url) {
    if (typeof url !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  render() {
    const colors = ['#D3C0CD', '#9FAF90', '#3A405A', '#3D70B2', '#E26D5A'];
    this.context.getEmotionalTone();
    let search = {};
    if (this.context && this.context.search)
      search = this.context.search;
    if (!search.rows)
      search.rows = [];
    const average = search.rows.reduce((acc, val) => {
      acc.joy += val.doc.analysis.emotion.joy;
      acc.anger += val.doc.analysis.emotion.anger;
      acc.sadness += val.doc.analysis.emotion.sadness;
      acc.disgust += val.doc.analysis.emotion.disgust;
      acc.fear += val.doc.analysis.emotion.fear;
      acc.sentiment[val.doc.analysis.sentiment.label]++;
      return acc;
    }, {
      sentiment: { positive: 0, negative: 0, neutral: 0 },
      joy: 0,
      disgust: 0,
      fear: 0,
      sadness: 0,
      anger: 0,
    });

    Object.keys(average).forEach(
      key => (typeof average[key] === 'number' ? average[key] /= search.rows.length : Object.keys(average[key]).forEach(
        key2 => average[key][key2] /= search.rows.length,
      )),
    );

    const data = Object.keys(average).filter(
      e => e !== 'sentiment',
    ).map(
      (key, i) => ({ title: key, value: Math.floor(average[key] * 100), color: colors[i] }),
    );

    return (
      <React.Fragment>
        <Header class='result_header' name='Sentiment Analysis' />
        <div className = 'result'>
          <div className = 'result_filter'>
              <div className= 'filter_bar'>
                <div className='test'>
                  <Dropdown titleList='Date' items={ <Datepicker /> }/>
                  <Dropdown titleList='Emotion' items={
                    data.map((item, i) => <Checkbox
                        key={i}
                        value={item.title}
                      />)
                  } />
                  <Dropdown titleList='Time Interval' items={
                    data.map((item, i) => <ul key={i}>{item.title}</ul>)
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
                  searchtext={this.context.searchword}
                  sentiment='Sentiment: Positive, Neagtive, Neutral'
                  date='Date: 23.05.19'
                  timeinterval='Time Interval: 23.05.19-25.05.19'
                />
              </div>
            </Card>
          </div>

            {data.map((element, i) => {
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
              <LineChart width={350} height={300} data={this.context.getEmotionalTone()} margin={{
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
            { search.rows.map((article, i) => {
              if (!article.doc)
                return '';
              let analysis = {};
              if (article.doc.analysis)
                analysis = article.doc.analysis;
              return (
                <NewsArticle
                  key={i}
                  date={new Date(article.doc.date).toLocaleDateString()} // ER HARD KODET
                  title={article.doc.headline}
                  newssource={article.doc.sourceID}
                  domFeeling={Object.keys(
                    analysis.emotion,
                  ).sort(
                    (a, b) => analysis.emotion[b] - analysis.emotion[a],
                  )[0]}
                  feelings= {analysis.emotion}
                  onClick= {() => this.makeRedirect(article.doc.url)}
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
