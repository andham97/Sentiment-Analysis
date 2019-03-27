import React, { Component } from 'react';
import Card from './Card';
import Header from './Header';
import DonutChart from './DonutChart';
import Parameteres from './Parameters';
import './style/Result.css';
import Exportpdf from './ExportPDF';
import NewsArticle from './NewsArticle';
import data from './donut_data';

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

class Result extends Component {
  render() {
    return (
      <React.Fragment>
        <Header class='result_header' name='Sentiment Analysis' />
        <div className = 'result'>
          <div className = 'result_filter'>
            <Card>
              <Exportpdf className='exportpdf'/>
            </Card>
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
            </Card>
          </div>

          <div className = 'result_news'>
            <Card>
              <NewsArticle date='03.03.19' title='Testing this shit' newssource='BBC' domFeeling='Disgust' emotions='Sad, Disgust, Happy'/>
              <NewsArticle date='03.03.19' title='Testing this shit' newssource='BBC' domFeeling='Disgust' emotions='Sad, Disgust, Happy'/>
              <NewsArticle date='03.03.19' title='Testing this shit' newssource='BBC' domFeeling='Disgust' emotions='Sad, Disgust, Happy'/>
            </Card>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Result;
