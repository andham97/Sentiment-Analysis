import React from 'react';
import PropTypes from 'prop-types';

const SearchContext = React.createContext();

class SearchStore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      words: [],
      searchType: '',
      sources: [],
    };
    this.getSearch = this.getSearch.bind(this);
    this.getWords = this.getWords.bind(this);
    this.getSources = this.getSources.bind(this);
    this.getEmotionalTone = this.getEmotionalTone.bind(this);
    this.getEmotionalToneSentiment = this.getEmotionalToneSentiment.bind(this);
    this.computeSearch = this.computeSearch.bind(this);
  }

  getSearch(opts) {
    if (opts.startDate && opts.startDate.getTime)
      opts.startDate = opts.startDate.getTime();
    if (opts.endDate && opts.endDate.getTime)
      opts.endDate = opts.endDate.getTime();
    localStorage.setItem('prev-search', JSON.stringify(opts));
    if (!opts.startDate)
      opts.startDate = 0;
    if (!opts.endDate)
      opts.endDate = new Date().getTime();
    this.setState({
      ...this.state, search: undefined, searchOpts: opts, searchType: opts.show ? 'emotion' : 'sentiment',
    });
    const sources = opts.checkedItemsNews.join(',');
    fetch(`/api/search?q=${opts.search}${sources.length > 0 ? `&sources=${sources}` : ''}${opts.startDate ? `&intervalStart=${opts.startDate}` : ''}${opts.endDate ? `&intervalEnd=${opts.endDate}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => response.json()).then((data) => {
      this.computeSearch(data, opts);
    }).catch(console.error);
  }

  computeSearch(data, opts) {
    const search = JSON.parse(JSON.stringify(data));
    search.docs = search.docs
      .filter(doc => (opts.startDate ? doc.date >= opts.startDate : true)
          && (opts.endDate ? doc.date <= opts.endDate : true));
    if (search.docs.length === 0) {
      this.setState({
        ...this.state,
        search: data,
        searchOpts: opts,
        searchType: opts.show ? 'emotion' : 'sentiment',
      });
    }
    else if (!opts.show) {
      const colors = ['#5EA3DB', '#FF5C54', '#AFBE8F'];
      const average = search.docs.reduce((acc, val) => {
        let sentiment = val.analysis.sentiment;
        if (!sentiment) {
          sentiment = {
            score: 0,
            label: 'neutral',
          };
        }
        let label = 'neutral';
        if (sentiment.score > opts.neutralThreshold)
          label = 'positive';
        else if (sentiment.score < -opts.neutralThreshold)
          label = 'negative';
        acc.sentiment[label]++;
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
        emotionalTone: this.getEmotionalToneSentiment(search, opts),
        searchOpts: opts,
        searchType: opts.show ? 'emotion' : 'sentiment',
      });
    }
    else if (opts.show) {
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
        Object.keys(emotion).forEach((k) => {
          acc[k] += emotion[k];
        });
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
        searchOpts: opts,
        searchType: opts.show ? 'emotion' : 'sentiment',
      });
    }
  }

  getSources() {
    fetch('/api/search/sources').then(res => res.json()).then((data) => {
      this.setState({
        ...this.state,
        sources: data,
      });
    });
  }

  getWords(count) {
    if (!count)
      count = 30;
    fetch(`/api/wordcloud?length=${count}`).then(res => res.json()).then((data) => {
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
        Object.keys(acc).forEach((k) => {
          acc[k].perc += emotion[k];
        });
        return acc;
      }, {
        anger: { perc: 0 },
        joy: { perc: 0 },
        disgust: { perc: 0 },
        fear: { perc: 0 },
        sadness: { perc: 0 },
      });
      Object.keys(emotions).forEach((k) => {
        emotions[k].perc /= days[key].length;
        emotions[k].perc *= 1000;
        emotions[k].perc = Math.round(emotions[k].perc);
        emotions[k].perc /= 10;
      });
      ret.push({
        id: i,
        date: new Date(Number(key)).toLocaleDateString(),
        emotions,
        time: new Date(Number(key)).getTime(),
      });
    });
    return ret;
  }

  getEmotionalToneSentiment(search, opts) {
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
        if (sentiment.score > opts.neutralThreshold)
          acc.positive.score++;
        if (sentiment.score > -opts.neutralThreshold)
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
      time: new Date(Number(val.key)).getTime(),
    }));
  }

  render() {
    return (
      <SearchContext.Provider value={{
        ...this.state,
        getSearch: this.getSearch,
        getWords: this.getWords,
        getSources: this.getSources,
        getEmotionalTone: this.getEmotionalTone,
        getEmotionalToneSentiment: this.getEmotionalToneSentiment,
        computeSearch: this.computeSearch,
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
