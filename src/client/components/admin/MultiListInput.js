/**
 * @module MultiListInput
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MultiListInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tempInput: '',
    };
    this.inputChange = this.inputChange.bind(this);
  }

  /**
   * Update state when input onChange
   *
   * @name inputChange
   * @param  {Object} e Event object
   */
  inputChange(e) {
    this.setState({ tempInput: e.target.value });
  }

  /**
   * Render the component
   * @return {String} Component HTML
   */
  render() {
    const {
      activeHost,
      title,
      addButton,
      emptyText,
      propname,
      propnameDel,
      update,
      newText,
      delButton,
      placeholder,
      validate,
    } = this.props;

    if (!propname
      || !activeHost
      || !title
      || !emptyText
      || !addButton
      || !newText
      || !placeholder)
      throw new Error('Error: MultiListInput not configured');

    return (<React.Fragment>
      <strong>{title}</strong><br />
      <ul>
        {activeHost[propname].length === 0 ? <i>{emptyText}</i> : activeHost[propname]
          .map((val, i) => <li key={i}>{val}<button onClick={() => {
            if (propnameDel)
              activeHost[propnameDel].push(activeHost[propname][i]);
            activeHost[propname].splice(i, 1);
            if (update)
              update({ ...activeHost });
          }}>{delButton}</button></li>)}
      </ul>
      {newText}: <input
        placeholder={placeholder}
        value={this.state.tempInput}
        onChange={this.inputChange} />
      <button onClick={() => {
        if (validate && !validate(this.state.tempInput))
          return;
        activeHost[propname].push(this.state.tempInput);
        this.setState({ ...this.state, tempInput: '' });
        if (update)
          update({ ...activeHost });
      }}>{addButton}</button><br />
    </React.Fragment>);
  }
}

MultiListInput.propTypes = {
  activeHost: PropTypes.any,
  addButton: PropTypes.any,
  title: PropTypes.any,
  emptyText: PropTypes.any,
  propname: PropTypes.any,
  propnameDel: PropTypes.any,
  update: PropTypes.any,
  newText: PropTypes.any,
  delButton: PropTypes.any,
  placeholder: PropTypes.any,
  validate: PropTypes.any,
};

export default MultiListInput;
