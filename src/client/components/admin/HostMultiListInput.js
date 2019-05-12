import React, { Component } from 'react';
import PropTypes from 'prop-types';

class HostMultiListInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tempInput: '',
    };
    this.inputChange = this.inputChange.bind(this);
  }

  inputChange(e) {
    this.setState({ tempInput: e.target.value });
  }

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
    } = this.props;

    if (!propname
      || !update
      || !activeHost
      || !title
      || !emptyText
      || !addButton
      || !newText
      || !placeholder)
      throw new Error('Error: HostMultiListInput not configured');

    return (<React.Fragment>
      <strong>{title}</strong><br />
      <ul>
        {activeHost[propname].length === 0 ? <i>{emptyText}</i> : activeHost[propname]
          .map((val, i) => <li key={i}>{val}<button onClick={() => {
            if (propnameDel)
              activeHost[propnameDel].push(activeHost[propname][i]);
            activeHost[propname].splice(i, 1);
            update({ ...activeHost });
          }}>{delButton}</button></li>)}
      </ul>
      {newText}: <input
        placeholder={placeholder}
        value={this.state.tempInput}
        onChange={this.inputChange} />
      <button onClick={() => {
        activeHost[propname].push(this.state.tempInput);
        this.setState({ ...this.state, tempInput: '' });
        update({ ...activeHost });
      }}>{addButton}</button><br />
    </React.Fragment>);
  }
}

HostMultiListInput.propTypes = {
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
};

export default HostMultiListInput;
