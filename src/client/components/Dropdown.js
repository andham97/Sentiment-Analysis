import React, { Component } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import onClickOutside from 'react-onclickoutside';
import PropTypes from 'prop-types';
import './style/Dropdown.css';

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownList: false,
    };
  }

  droppedList() {
    this.setState({
      dropdownList: true,
    });
  }

  handleClickOutside() {
    if (this.props.onClose)
      this.props.onClose();
    this.setState({
      dropdownList: false,
    });
  }

  render() {
    const { titleList, items } = this.props;
    const { dropdownList } = this.state;
    return (
        <div className='dropdown' onClick={() => this.droppedList()}>
          <div className='dropdown_title'>{ titleList }
            {dropdownList ? <span className='arrowDown'> <FaAngleUp /> </span> : <span className='arrowDown'> <FaAngleDown /> </span> }
          </div>
          <br />
          <br />
            {dropdownList ? (
              <div>{ items }</div>
            )
              : (
                null
              )
        }
        </div>
    );
  }
}

Dropdown.propTypes = {
  titleList: PropTypes.any,
  items: PropTypes.any,
  onClose: PropTypes.any,
};

export default onClickOutside(Dropdown);
