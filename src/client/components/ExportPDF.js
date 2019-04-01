import React, { Component } from 'react';
import './style/ExportPDF.css';
import PropTypes from 'prop-types';

export class ExportPDF extends Component {
  render() {
    return (
      <div>
        <button onClick={this.props.onClick} className='exportPDF'>Export PDF</button>
      </div>
    );
  }
}

ExportPDF.propTypes = {
  onClick: PropTypes.any,
};

export default ExportPDF;
