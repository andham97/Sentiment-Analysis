import React, { Component } from 'react';
import Card from './Card';
import Header from './Header';
import DonutChartAnger from './DonutChartAnger';
import './style/Result.css';

class Result extends Component {
  render() {
    return [
      <Header key={1} class='result_header' name='Sentiment Analysis' />,
      <div key={2} className = 'result'>
        <div className = 'result_filter'>
          <Card>
          </Card>
        </div>

        <div className = 'result_parameters'>
          <Card />
        </div>

        <div className = 'result_graphs_joy'>
          <Card>
            <div className='graphs' style={{ margin: '20px' }} >
            </div>
          </Card>
        </div>

        <div className = 'result_graphs_anger'>
          <Card>
          <div className='graphs' style={{ margin: '20px' }} >
            <DonutChartAnger className='graph'/>
          </div>
          </Card>
        </div>

        <div className = 'result_graphs_disgust'>
          <Card>
            <div className='graphs'></div>
          </Card>
        </div>

        <div className = 'result_graphs_sadness'>
          <Card>
            <div className='graphs'></div>
          </Card>
        </div>

        <div className = 'result_graphs_fear'>
          <Card>
            <div className='graphs'></div>
          </Card>
        </div>

        <div className = 'result_graph'>
          <Card />
        </div>

        <div className = 'result_news'>
          <Card />
        </div>
      </div>,
    ];
  }
}

export default Result;
