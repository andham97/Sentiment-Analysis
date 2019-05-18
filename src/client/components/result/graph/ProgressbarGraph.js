import React from 'react';
import '../../style/ProgressbarGraph.css';
import PropTypes from 'prop-types';

/**
 * Progress bar graph
 *
 * @function ProgressBar
 * @param  {Object}    input
 */
const ProgressBar = input => (
      <div className="progress-bar">
        <Filler perc={input.perc} color={input.color}/>
      </div>
);

/**
 * Filler
 *
 * @function Filler
 * @param  {Object} input
 */
const Filler = input => (
  <div className="filler" style={{ width: `${input.perc}%`, backgroundColor: `#${input.color}` }} />
);

ProgressBar.propTypes = {
  perc: PropTypes.any,
};

Filler.propTypes = {
  perc: PropTypes.any,
};

export default ProgressBar;
