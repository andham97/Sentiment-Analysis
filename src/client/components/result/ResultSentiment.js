import React, { Component } from 'react';
import '../style/ResultSentiment.css';
import Header from '../Header';
import Dropdown from '../Dropdown';
import Checkbox from '../Checkbox';
import Datepicker from './DatePicker';
import Exportpdf from './ExportPDF';

class ResultSentiment extends Component {
  render() {
    return (
      <React.Fragment>
        <Header class='resultSentiment_header' name='Sentiment Analysis' />
        <div className='resultSentiment'>
          <div className='resultSentiment_filter'>
              <div className= 'filterSentiment_bar'>
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

          <div className='resultSentiment_parameters'></div>
            <div className='resultSentiment_graphs_negative'></div>
            <div className='resultSentiment_graphs_neutral'></div>
            <div className='resultSentiment_graphs_positive'></div>

          <div className='resultSentiment_emotionalTone'></div>

          <div className='resultSentiment_articles'></div>
        </div>
      </React.Fragment>
    );
  }
}

export default ResultSentiment;
