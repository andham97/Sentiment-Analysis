import React from 'react';
import PropTypes from 'prop-types';

const DashboardContext = React.createContext();

class DashboardStore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchWord: '',
    };

    this.setSearchWord.bind(this);
  }

  setSearchWord(newSearchWord) {
    this.setState({ ...this.state, searchWord: newSearchWord });
  }

  render() {
    return (
      <DashboardContext.Provider value={{
        searchWord: this.state.searchWord,
        setSearchWord: this.setSearchWord,
      }}>
      {this.props.children}
      </DashboardContext.Provider>
    );
  }
}

DashboardStore.propTypes = {
  children: PropTypes.any,
};

export default DashboardStore;

export { DashboardContext };
