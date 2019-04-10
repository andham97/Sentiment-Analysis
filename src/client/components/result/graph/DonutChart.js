import React, { Component } from 'react';
import ReactMinimalPieChart from 'react-minimal-pie-chart';
import '../../style/DonutChart.css';
import Proptypes from 'prop-types';

class DonutChart extends Component {
  render() {
    return (<React.Fragment>
      <ReactMinimalPieChart
        className={this.props.chart}
        data={this.props.data}
        totalValue={100}
        lineWidth={25}
        label
        labelStyle={{
          fontSize: '25px',
          fontFamily: 'sans-serif',
        }}
        labelPosition={0}
        animate
      />
      <div className={this.props.label} align='center'>{this.props.name}</div>
    </React.Fragment>);
  }
}

DonutChart.propTypes = {
  chart: Proptypes.any,
  label: Proptypes.any,
  data: Proptypes.any,
  name: Proptypes.any,
};

export default DonutChart;
