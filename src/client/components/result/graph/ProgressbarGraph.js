import React from 'react';
import '../../style/ProgressbarGraph.css';
import PropTypes from 'prop-types';

const ProgressBar = input => (
      <div className="progress-bar">
        <Filler perc={input.perc} color={input.color}/>
      </div>
);


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
