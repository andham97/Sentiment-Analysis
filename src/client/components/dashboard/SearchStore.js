import React from 'react';
import PropTypes from 'prop-types';

const SearchContext = React.createContext();

class SearchStore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: {},
      words: [],
      searchword: '',
    };
    this.getSearch = this.getSearch.bind(this);
    this.getWords = this.getWords.bind(this);
    this.getEmotionalTone = this.getEmotionalTone.bind(this);
  }

  getSearch(opts) {
    return new Promise((resolve, reject) => {
      fetch(`/api/search?q=${opts}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => response.json()).then((data) => {
        this.setState({ ...this.state, search: data, searchword: opts });
        resolve();
      }).catch(reject);
    });
  }

  getWords() {
    fetch('/api/wordcloud?length=30').then(res => res.json()).then((data) => {
      this.setState({
        ...this.state,
        words: data.map(elem => ({
          value: elem.key,
          count: elem.value,
        })),
      });
    });
  }

  getEmotionalTone() {
    const sortArr = this.state.search.rows.sort(
      (a, b) => a.doc.date - b.doc.date,
    ).map((element) => {
      const date = new Date(element.doc.date);
      date.setHours(12);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      element.doc.date = date.getTime();
      return element;
    });
    const days = {};
    sortArr.forEach((element) => {
      if (days[element.doc.date])
        days[element.doc.date].push(element);
      else
        days[element.doc.date] = [element];
    });
    const ret = [];
    Object.keys(days).forEach((key, i) => {
      const emotions = days[key].reduce((acc, val) => {
        acc.anger.perc += val.doc.analysis.emotion.anger;
        acc.joy.perc += val.doc.analysis.emotion.joy;
        acc.disgust.perc += val.doc.analysis.emotion.disgust;
        acc.fear.perc += val.doc.analysis.emotion.fear;
        acc.sadness.perc += val.doc.analysis.emotion.sadness;
        return acc;
      }, {
        anger: { perc: 0 },
        joy: { perc: 0 },
        disgust: { perc: 0 },
        fear: { perc: 0 },
        sadness: { perc: 0 },
      });
      emotions.anger.perc /= days[key].length;
      emotions.joy.perc /= days[key].length;
      emotions.disgust.perc /= days[key].length;
      emotions.fear.perc /= days[key].length;
      emotions.sadness.perc /= days[key].length;
      emotions.anger.perc *= 100;
      emotions.joy.perc *= 100;
      emotions.disgust.perc *= 100;
      emotions.fear.perc *= 100;
      emotions.sadness.perc *= 100;
      ret.push({
        id: i,
        date: new Date((+key)).toLocaleDateString(),
        emotions,
      });
    });
    console.log(ret);
    return ret;
  }

  render() {
    return (
      <SearchContext.Provider value={{
        ...this.state,
        getSearch: this.getSearch,
        getWords: this.getWords,
        getEmotionalTone: this.getEmotionalTone,
      }}>
      {this.props.children}
      </SearchContext.Provider>
    );
  }
}

SearchStore.propTypes = {
  children: PropTypes.any,
};

export default SearchStore;

export { SearchContext };
