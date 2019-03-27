import React from 'react';
import './style/ProgressbarGraph.css';
import PropTypes from 'prop-types';

const ProgressBar = percent => (
      <div className="progress-bar">
        <Filler perc={percent.perc} />
      </div>
);

const Filler = percent => <div className="filler" style={{ width: `${percent.perc}%` }} />;

ProgressBar.propTypes = {
  perc: PropTypes.any,
};

Filler.propTypes = {
  perc: PropTypes.any,
};

export default ProgressBar;
