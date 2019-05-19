import React from 'react';
import '../../style/ProgressbarGraph.css';

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

export default ProgressBar;
