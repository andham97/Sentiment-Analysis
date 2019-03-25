import React, { Component } from 'react';
import ReactMinimalPieChart from 'react-minimal-pie-chart';
import './style/DonutChart.css';
import data from './donut_data';

class DonutChartAnger extends Component {
  render() {
    const json = data;
    const arr = [];
    Object.keys(json).forEach((key) => {
      arr.push(json[key]);
    });
    if (arr[0].title === 'Anger') {
      return (
        <div>
              <ReactMinimalPieChart
                className='anger_chart'
                data={arr}
                totalValue={100}
                lineWidth={25}
                label
                labelStyle={{
                  fontSize: '25px',
                  fontFamily: 'sans-serif',
                }}
                labelPosition={0}
              />
              <div className='label_anger' align='center'>{arr[0].title}</div>
        </div>
      );
    }
    return (
      <div></div>
    );
  }
}

export default DonutChartAnger;
