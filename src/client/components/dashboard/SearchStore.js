import React from 'react';
import PropTypes from 'prop-types';

const SearchContext = React.createContext();

class SearchStore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      words: [],
      searchOpts: {},
      searchType: '',
    };
    this.getSearch = this.getSearch.bind(this);
    this.getWords = this.getWords.bind(this);
    this.getEmotionalTone = this.getEmotionalTone.bind(this);
    this.getEmotionalToneSentiment = this.getEmotionalToneSentiment.bind(this);
  }

  getSearch(opts) {
    console.log(opts);
    localStorage.setItem('prev-search', opts.search);
    this.setState({
      ...this.state, search: undefined, searchOpts: opts, searchType: opts.show ? 'emotion' : 'sentiment',
    });
    fetch(`/api/search?q=${opts.search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => response.json()).then((data) => {
      const search = data;
      if (this.state.searchType === 'sentiment') {
        const colors = ['#5EA3DB', '#FF5C54', '#AFBE8F'];
        const average = search.docs.reduce((acc, val) => {
          let sentiment = val.analysis.sentiment;
          if (!sentiment) {
            sentiment = {
              score: 0,
              label: 'neutral',
            };
          }
          acc.sentiment[val.analysis.sentiment.label]++;
          return acc;
        }, {
          sentiment: { positive: 0, negative: 0, neutral: 0 },
        });

        Object.keys(average).forEach((key) => {
          if (typeof average[key] === 'number')
            average[key] /= search.docs.length;
          else
            Object.keys(average[key]).forEach((key2) => {
              average[key][key2] /= search.docs.length;
            });
        });
        this.setState({
          ...this.state,
          graphData: Object.keys(average.sentiment ? average.sentiment : {}).map(
            (key, i) => (
              {
                title: key,
                value: Math.floor(average.sentiment[key] * 100),
                color: colors[i],
              }),
          ),
          search: data,
          emotionalTone: this.getEmotionalToneSentiment(search),
        });
      }
      else if (this.state.searchType === 'emotion') {
        const colors = ['#D3C0CD', '#9FAF90', '#3A405A', '#3D70B2', '#E26D5A'];
        const average = search.docs.reduce((acc, val) => {
          let emotion = val.analysis.emotion;
          if (!emotion) {
            emotion = {
              anger: 0,
              joy: 0,
              disgust: 0,
              fear: 0,
              sadness: 0,
            };
          }
          acc.joy += emotion.joy;
          acc.anger += emotion.anger;
          acc.sadness += emotion.sadness;
          acc.disgust += emotion.disgust;
          acc.fear += emotion.fear;
          acc.sentiment[val.analysis.sentiment.label]++;
          return acc;
        }, {
          sentiment: { positive: 0, negative: 0, neutral: 0 },
          joy: 0,
          disgust: 0,
          fear: 0,
          sadness: 0,
          anger: 0,
        });

        Object.keys(average).forEach((key) => {
          if (typeof average[key] === 'number')
            average[key] /= search.docs.length;
          else
            Object.keys(average[key]).forEach((key2) => {
              average[key][key2] /= search.docs.length;
            });
        });
        this.setState({
          ...this.state,
          graphData: Object.keys(average).filter(e => e !== 'sentiment').map(
            (key, i) => ({ title: key, value: Math.floor(average[key] * 100), color: colors[i] }),
          ),
          search: data,
          emotionalTone: this.getEmotionalTone(search),
        });
      }
    }).catch(console.error);
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

  getEmotionalTone(search) {
    console.log(search);
    const sortArr = search.docs.sort(
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

  getEmotionalToneSentiment(search) {
    console.log(search);
    const sortArr = search.docs.sort(
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
