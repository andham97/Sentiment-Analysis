import React from 'react';
import PropTypes from 'prop-types';
import beautify from 'js-beautify';
import cheerio from 'cheerio';
import Alert from 'react-s-alert';

const AdminPanelContext = React.createContext();
const hostBoilerplate = {
  body: [],
  date: {
    sel: '',
    function: '(date, months) => {\n  return new Date();\n};',
    attribute: '',
  },
  exclude: [],
  headlines: [],
  name: '',
  sourceID: '',
  hostnames: [],
  hostDeletions: [],
  headlineDeletions: [],
  bodyDeletions: [],
  excludeDelections: [],
};

const clone = object => JSON.parse(JSON.stringify(object));

class AdminPanelStore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hosts: [],
      activeHost: hostBoilerplate,
      activeIndex: -1,
      testURL: '',
      whitelist: false,
      urlCount: -1,
      scheduleItems: [],
    };
    this.getHosts = this.getHosts.bind(this);
    this.setActiveHost = this.setActiveHost.bind(this);
    this.updateActiveHost = this.updateActiveHost.bind(this);
    this.saveHost = this.saveHost.bind(this);
    this.testURLChange = this.testURLChange.bind(this);
    this.loadTestURL = this.loadTestURL.bind(this);
    this.clearActiveHost = this.clearActiveHost.bind(this);
    this.isWhitelisted = this.isWhitelisted.bind(this);
    this.fetchNews = this.fetchNews.bind(this);
    this.getUrlCount = this.getUrlCount.bind(this);
    this.getSchedule = this.getSchedule.bind(this);
    this.addScheduleItem = this.addScheduleItem.bind(this);
    this.deleteScheduleItem = this.deleteScheduleItem.bind(this);
  }

  addScheduleItem(item) {
    fetch('/api/ws/schedule', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(item),
    }).then(res => res.json()).then((nItem) => {
      const { scheduleItems } = this.state;
      scheduleItems.push(nItem);
      this.setState({
        ...this.state,
        scheduleItems,
      });
    }).catch(console.error);
  }

  deleteScheduleItem(id) {
    fetch(`/api/ws/schedule/${id}`, {
      method: 'DELETE',
    }).then(res => res.json()).then((did) => {
      let { scheduleItems } = this.state;
      scheduleItems = scheduleItems.filter(item => item.id !== did);
      this.setState({
        ...this.state,
        scheduleItems,
      });
    }).catch(console.error);
  }

  getSchedule() {
    fetch('/api/ws/schedule').then(res => res.json()).then((items) => {
      this.setState({
        ...this.state,
        scheduleItems: items,
      });
    }).catch(console.error);
  }

  getUrlCount() {
    fetch('/api/ws/urlCount', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json())
      .then(data => this.setState({ ...this.state, urlCount: data.count }))
      .catch(console.error);
  }

  fetchNews(sources, hsts) {
    Alert.info(`Fetching news from ${sources.reduce((acc, src) => `${acc} ${hsts[src]},`, '')}`.slice(0, -1), { position: 'top' });
    fetch('/api/ws/fetchNews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sources,
      }),
    }).then(res => res.json()).then((data) => {
      Alert.success(`${data} articles started to load`, { position: 'top' });
    }).catch(console.error);
  }

  scrapeURL(url) {
    if (typeof url !== 'string')
      return;
    fetch('/api/ws', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: [url],
      }),
    });
  }

  isWhitelisted() {
    fetch('/api/auth/whitelist').then(resp => resp.json()).then((wl) => {
      this.setState({ ...this.state, whitelist: wl });
    }).catch(console.error);
  }

  clearActiveHost() {
    this.setState({ ...this.state, activeIndex: -1, activeHost: clone(hostBoilerplate) });
  }

  loadTestURL() {
    this.setState({ ...this.state, testPage: 1 });
    fetch(`/api/ws/load/${encodeURIComponent(this.state.testURL)}`).then(resp => resp.text()).then((data) => {
      this.setState({ ...this.state, testPage: cheerio.load(data) });
    });
  }

  testURLChange(testURL) {
    this.setState({ ...this.state, testURL });
  }

  getHosts() {
    fetch('/api/ws/hosts').then(response => response.json()).then((data) => {
      const hosts = Object.keys(data).filter(key => key.indexOf('_') !== 0 && key !== 'type').reduce((acc, key) => {
        const selection = acc.filter(e => e.sourceID === data[key].sourceID);
        if (selection.length === 0) {
          const d = data[key];
          d.hostnames = [key];
          d.hostDeletions = [];
          acc.push(d);
        }
        else
          selection[0].hostnames.push(key);
        return acc;
      }, [])
        .map(val => ({
          ...val,
          date: {
            ...val.date,
            function: beautify.js(val.date.function, {
              indent_size: 2,
              space_in_empty_parent: false,
            }),
          },
        }))
        .sort((a, b) => ([a.sourceID, b.sourceID].sort()[0] === a.sourceID ? -1 : 1));
      this.setState({ ...this.state, hosts });
    });
  }

  setActiveHost(i) {
    this.setState({
      ...this.state,
      activeIndex: i,
      activeHost: i === -1 ? clone(hostBoilerplate) : clone(this.state.hosts[i]),
    });
  }

  updateActiveHost(host) {
    host.sourceID = host.name.split(' ').join('-').toLowerCase();
    this.setState({
      ...this.state,
      activeHost: host,
    });
  }

  saveHost() {
    const { hosts } = this.state;
    if (this.state.activeIndex > -1)
      hosts[this.state.activeIndex] = clone(this.state.activeHost);
    else
      hosts.push(clone(this.state.activeHost));
    hosts.sort((a, b) => ([a.sourceID, b.sourceID].sort()[0] === a.sourceID ? -1 : 1));
    Alert.info('Saving host...', { postiion: 'top' });
    fetch('/api/ws/hosts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state.activeHost),
    }).then((data) => {
      Alert.success('Host saved', { postiion: 'top' });
      console.log(data); // TODO: add alert
    }).catch(console.error);
    this.setState({
      ...this.state, hosts,
    });
  }

  render() {
    return (
      <AdminPanelContext.Provider value={{
        ...this.state,
        getHosts: this.getHosts,
        setActiveHost: this.setActiveHost,
        updateActiveHost: this.updateActiveHost,
        saveHost: this.saveHost,
        testURLChange: this.testURLChange,
        loadTestURL: this.loadTestURL,
        clearActiveHost: this.clearActiveHost,
        isWhitelisted: this.isWhitelisted,
        scrapeURL: this.scrapeURL,
        fetchNews: this.fetchNews,
        getUrlCount: this.getUrlCount,
        getSchedule: this.getSchedule,
        addScheduleItem: this.addScheduleItem,
        deleteScheduleItem: this.deleteScheduleItem,
      }}>
      {this.props.children}
      </AdminPanelContext.Provider>
    );
  }
}

AdminPanelStore.propTypes = {
  children: PropTypes.any,
  hosts: PropTypes.any,
};

export default AdminPanelStore;

export { AdminPanelContext };
