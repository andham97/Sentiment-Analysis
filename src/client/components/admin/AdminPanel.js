import React, { Component } from 'react';
import AceEditor from 'react-ace';
import brace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/tomorrow';
import '../style/AdminPanel.css';
import Header from '../Header';
import Card from '../Card';
import { AdminPanelContext } from './AdminPanelStore';
import Scraper from './Scraper';

class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tempHost: '',
      tempExclude: '',
    };

    this.hostChange = this.hostChange.bind(this);
    this.excludeChange = this.excludeChange.bind(this);
  }

  hostChange(e) {
    this.setState({ ...this.state, tempHost: e.target.value });
  }

  excludeChange(e) {
    this.setState({ ...this.state, tempExclude: e.target.value });
  }

  componentWillMount() {
    this.context.getHosts();
  }

  selectHost(i) {
    return () => {
      this.context.setActiveHost(i);
    };
  }

  render() {
    const { hosts, activeHost } = this.context;
    return <React.Fragment>
      <Header name='Webscraper administrator tool' />
      <div className='wrapper'>
        <Card>
          <ul>
            {hosts.length === 0 ? 'Loading hosts...' : hosts.map((host, i) => <li key={i}>
              <span onClick={this.selectHost(i).bind(this)}><strong>{host.sourceID}</strong>:{host.hostnames.map((name, j) => `${j > 0 ? ',' : ''} ${name}`)}</span>
            </li>)}
          </ul>
        </Card>
        <Card>
          Name: <input placeholder='Source name' value={activeHost.name} onChange={e => this.context.updateActiveHost({ ...activeHost, name: e.target.value })} /><br />
          Headline CSS-selector: <input placeholder='Headline selector' value={activeHost.headline} onChange={e => this.context.updateActiveHost({ ...activeHost, headline: e.target.value })} /><br />
          Body CSS-selector: <input placeholder='Body selector' value={activeHost.body} onChange={e => this.context.updateActiveHost({ ...activeHost, body: e.target.value })} /><br />
          Date CSS-selector: <input placeholder='Date selector' value={activeHost.date.sel} onChange={e => this.context.updateActiveHost({ ...activeHost, date: { ...activeHost.date, sel: e.target.value } })} /><br />
          <strong>Hostnames</strong><br />
          <ul>
            {activeHost.hostnames.length === 0 ? <i>No hostnames</i> : activeHost.hostnames
              .map((val, i) => <li key={i}>{val}<button onClick={() => {
                activeHost.hostDeletions.push(activeHost.hostnames[i]);
                activeHost.hostnames.splice(i, 1);
                this.context.updateActiveHost(activeHost);
              }}>Delete</button></li>)}
          </ul>
          New host: <input placeholder='Hostname' value={this.state.tempHost} onChange={this.hostChange} /><button onClick={() => {
            activeHost.hostnames.push(this.state.tempHost);
            this.setState({ ...this.state, tempHost: '' });
            this.context.updateActiveHost({ ...activeHost });
          }}>Add host</button><br />
          <strong>Body exclude CSS-selector</strong>
          <ul>
            {activeHost.exclude.length === 0 ? <i>No exclude patterns</i> : activeHost.exclude
              .map((val, i) => <li key={i}>{val}</li>)}
          </ul>
          New exclusion pattern: <input placeholder='Pattern' value={this.state.tempExclude} onChange={this.excludeChange} /><button onClick={() => {
            activeHost.exclude.push(this.state.tempExclude);
            this.setState({ ...this.state, tempExclude: '' });
            this.context.updateActiveHost({ ...activeHost });
          }}>Add pattern</button><br />
          <button onClick={() => this.context.saveHost()}>Save host</button>
          <button onClick={() => this.context.clearActiveHost()}>Clear fields</button>
        </Card>
        <Card cName='admin'>
          <AceEditor
            placeholder='Create function with signatur (date: string, months: array)'
            mode='javascript'
            theme='tomorrow'
            name='editor'
            onChange={(code) => {
              this.context.updateActiveHost({
                ...activeHost,
                date: {
                  ...activeHost.date,
                  function: code,
                },
              });
            }}
            fontSize={14}
            showGutter
            wrapEnabled
            highlightActiveLine
            width='100%'
            height='100%'
            value={activeHost.date.function}
            setOptions={{
              showLineNumbers: true,
              tabSize: 2,
            }}
            editorProps={{ $blockScrolling: Infinity }}/>
        </Card>
        <Card>
          Test website: <input placeholder='Test site URL' value={this.context.testURL} onChange={e => this.context.testURLChange(e.target.value)} />
          <button onClick={() => this.context.loadTestURL()}>Load page</button><br />
          <Scraper />
        </Card>
      </div>
    </React.Fragment>;
  }
}

AdminPanel.contextType = AdminPanelContext;

export default AdminPanel;
