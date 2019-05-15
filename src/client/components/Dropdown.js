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
      dropdownList: !this.state.dropdownList,
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
        <div className={`dropdown ${this.props.className ? this.props.className : ''}`} onClick={(e) => {
          if (e.target.className === `dropdown ${this.props.className ? this.props.className : ''}`)
            this.droppedList();
        }}>
          <div className='dropdown_title' onClick={() => this.droppedList()}>{ titleList }
            {dropdownList ? <span className='arrowDown'> <FaAngleUp /> </span> : <span className='arrowDown'> <FaAngleDown /> </span> }
          </div>
          <br />
          <br />
            {dropdownList ? (
              <div className='dropdown dropdown-items'>{ items }</div>
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
  className: PropTypes.any,
};

export default onClickOutside(Dropdown);
