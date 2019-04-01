import React, { Component } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import Card from './Card';
import Header from './Header';
import DonutChart from './DonutChart';
import Parameteres from './Parameters';
import './style/Result.css';
import Exportpdf from './ExportPDF';
import NewsArticle from './NewsArticle';
import Dropdown from './Dropdown';
import Datepicker from './DatePicker';
import data from './donut_data';
import newsArticles from './news_articles';

const classNameMap = (name) => {
  switch (name) {
    case 'Anger':
      return 'anger';
    case 'Sad':
      return 'sadness';
    case 'Fear':
      return 'fear';
    case 'Joy':
      return 'joy';
    case 'Disgust':
      return 'disgust';
    default:
      return [];
  }
};

const colorAnger = '#E26D5A';
const colorFear = '#3A405A';
const colorJoy = '#D3C0CD';
const colorSad = '#3D70B2';
const colorDisgust = '#9FAF90';

class Result extends Component {
  render() {
    return (
      <React.Fragment>
        <Header class='result_header' name='Sentiment Analysis' />
        <div className = 'result'>
          <div className = 'result_filter'>
              <div className= 'filter_bar'>
                <div className='test'>
                  <Dropdown titleList='Date' items={ <Datepicker /> }/>
                  <Dropdown titleList='Emotion' items={data.map((item, i) => <ul key={i}>{item.title}</ul>)} />
                  <Dropdown titleList='Time Interval' items={ data }/>
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
                <Parameteres searchtext='Trump, President' sentiment='Sentiment: Positive, Neagtive, Neutral' date='Date: 23.05.19' timeinterval='Time Interval: 23.05.19-25.05.19' />
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
              <LineChart width={350} height={300} data={newsArticles} margin={{
                top: 20,
              }}>
                <XAxis dataKey="date"/>
                <YAxis/>
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" name="Anger" dataKey="emotions.Anger.perc" stroke={colorAnger} activeDot={{ r: 8 }}/>
                <Line type="monotone" name="Joy" dataKey="emotions.Joy.perc" stroke={colorJoy} />
                <Line type="monotone" name="Fear" dataKey="emotions.Fear.perc" stroke={colorFear} />
                <Line type="monotone" name="Sad" dataKey="emotions.Sad.perc" stroke={colorSad} />
                <Line type="monotone" name="Disgust" dataKey="emotions.Disgust.perc" stroke={colorDisgust} />
              </LineChart>
            </Card>
          </div>

          <div className = 'result_news'>
            <Card>
            { newsArticles.map((article, i) => (
              <NewsArticle
                key={i}
                date={article.date}
                title={article.title}
                newssource={article.newssource}
                domFeeling={article.domFeeling}
                feelings= {article.emotions}
              />
            ))}
            </Card>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Result;
