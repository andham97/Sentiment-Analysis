import React from 'react';
import PropTypes from 'prop-types';

const SearchContext = React.createContext();

class SearchStore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      words: [],
      searchword: '',
    };
    this.getSearch = this.getSearch.bind(this);
    this.getWords = this.getWords.bind(this);
    this.getEmotionalTone = this.getEmotionalTone.bind(this);
    this.getEmotionalToneSentiment = this.getEmotionalToneSentiment.bind(this);
  }

  getSearch(opts) {
    return new Promise((resolve, reject) => {
      localStorage.setItem('prev-search', opts);
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
    const sortArr = this.state.search.docs.sort(
      (a, b) => a.date - b.date,
    ).filter(a => a.date > 0).map((element) => {
      const date = new Date(element.date);
      date.setHours(12);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      element.date = date.getTime();
      return element;
    });
    const days = {};
    sortArr.forEach((element) => {
      if (days[element.date])
        days[element.date].push(element);
      else
        days[element.date] = [element];
    });
    const ret = [];
    Object.keys(days).forEach((key, i) => {
      const emotions = days[key].reduce((acc, val) => {
        const emotion = val.analysis.emotion;
        if (!emotion)
          return acc;
        acc.anger.perc += emotion.anger;
        acc.joy.perc += emotion.joy;
        acc.disgust.perc += emotion.disgust;
        acc.fear.perc += emotion.fear;
        acc.sadness.perc += emotion.sadness;
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
        date: new Date(Number(key)).toLocaleDateString(),
        emotions,
      });
    });
    return ret;
  }

  getEmotionalToneSentiment() {
    const sortArr = this.state.search.docs.sort(
      (a, b) => a.date - b.date,
    ).filter(a => a.date > 0).map((element) => {
      const date = new Date(element.date);
      date.setHours(12);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      element.date = date.getTime();
      return element;
    });
    const days = {};
    sortArr.forEach((element) => {
      if (days[element.date])
        days[element.date].push(element);
      else
        days[element.date] = [element];
    });
    const ret = Object.keys(days).map((key) => {
      const sentiments = days[key].reduce((acc, val) => {
        const sentiment = val.analysis.sentiment;
        if (!sentiment)
          return acc;
        if (sentiment.score > 0.2)
          acc.positive.score++;
        if (sentiment.score > -0.2)
          acc.neutral.score++;
        else
          acc.negative.score++;
        return acc;
      }, {
        negative: { score: 0 },
        neutral: { score: 0 },
        positive: { score: 0 },
      });
      return { sentiments, key };
    });
    return ret.map((val, i) => ({
      id: i,
      date: new Date(Number(val.key)).toLocaleDateString(),
      sentiments: val.sentiments,
    }));
  }

  render() {
    return (
      <SearchContext.Provider value={{
        ...this.state,
        getSearch: this.getSearch,
        getWords: this.getWords,
        getEmotionalTone: this.getEmotionalTone,
        getEmotionalToneSentiment: this.getEmotionalToneSentiment,
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
