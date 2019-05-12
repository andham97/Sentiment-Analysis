import React, { Component } from 'react';
import AceEditor from 'react-ace';
import brace from 'brace'; // eslint-disable-line no-unused-vars
import 'brace/mode/javascript';
import 'brace/theme/tomorrow';
import '../style/AdminPanel.css';
import Header from '../Header';
import Card from '../Card';
import HostMultiListInput from './HostMultiListInput';
import { AdminPanelContext } from './AdminPanelStore';
import Scraper from './Scraper';

class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tempScrapeURL: '',
      tempDateSel: '',
      tempDateAttr: '',
      tempSelection: [],
    };

    this.scrapeURLChange = this.scrapeURLChange.bind(this);
    this.dateAttrChange = this.dateAttrChange.bind(this);
    this.dateSelChange = this.dateSelChange.bind(this);
  }

  dateSelChange(e) {
    this.setState({ ...this.state, tempDateSel: e.target.value });
  }

  dateAttrChange(e) {
    this.setState({ ...this.state, tempDateAttr: e.target.value });
  }

  scrapeURLChange(e) {
    this.setState({ ...this.state, tempScrapeURL: e.target.value });
  }

  componentWillMount() {
    this.context.getHosts();
    this.context.isWhitelisted();
    this.context.getUrlCount();
    this.context.getTermCount();
  }

  selectHost(i) {
    return () => {
      this.context.setActiveHost(i);
    };
  }

  render() {
    const { hosts, activeHost } = this.context;
    return <React.Fragment>
      <Header name='Webscraper administration tool' />
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
          <HostMultiListInput
            title='Headline selectors'
            addButton='Add selector'
            emptyText='No selectors'
            newText='New selector'
            delButton='Delete'
            placeholder='Headline selector'
            propname='headlines'
            activeHost={activeHost}
            update={this.context.updateActiveHost} /><br />
          <HostMultiListInput
            title='Body selectors'
            addButton='Add selector'
            emptyText='No selectors'
            newText='New selector'
            delButton='Delete'
            placeholder='Body selector'
            propname='body'
            activeHost={activeHost}
            update={this.context.updateActiveHost} /><br />
          <HostMultiListInput
            title='Hostnames'
            addButton='Add host'
            emptyText='No hostnames'
            newText='New host'
            delButton='Delete'
            placeholder='Hostname'
            propname='hostnames'
            propnameDel='hostDeletions'
            activeHost={activeHost}
            update={this.context.updateActiveHost} /><br />
          <HostMultiListInput
            title='Body exclude CSS-selector'
            addButton='Add selector'
            emptyText='No exclude selectors'
            newText='New exclusion selector'
            delButton='Delete'
            placeholder='Exclude selector'
            propname='exclude'
            activeHost={activeHost}
            update={this.context.updateActiveHost} /><br />
          <strong>Date selectors</strong><br />
          <ul>
            {activeHost.date.sel.length === 0 ? <i>No selectors</i> : activeHost.date.sel
              .map((val, i) => <li key={i}>{val.sel} : {val.attr === '' ? '<no attribute>' : val.attr}<button onClick={() => {
                activeHost.date.sel.splice(i, 1);
                this.context.updateActiveHost({ ...activeHost });
              }}>Delete</button></li>)}
          </ul>
          New selector: <input
            placeholder='Date selector'
            value={this.state.tempDateSel}
            onChange={this.dateSelChange} /><br />
          Attribute (optional)<input
              placeholder='Attribute name'
              value={this.state.tempDateAttr}
              onChange={this.dateAttrChange} />
          <button onClick={() => {
            activeHost.date.sel
              .push({ sel: this.state.tempDateSel, attr: this.state.tempDateAttr });
            this.setState({ ...this.state, tempDateSel: '', tempDateAttr: '' });
            this.context.updateActiveHost({ ...activeHost });
          }}>Add selector</button><br /><br />
          <i>If using attribute, the value contained in the attribute will
            be passed to the date function instead of the text in the selected element.
            The element is selected with the CSS-selector above</i>
          <button onClick={() => this.context.saveHost()}>Save host</button>
          <button onClick={() => this.context.clearActiveHost()}>Clear fields</button>
        </Card>
        <Card>
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
            className='admin'
            editorProps={{ $blockScrolling: Infinity }}/>
        </Card>
        <Card>
          Test website: <input placeholder='Test site URL' value={this.context.testURL} onChange={e => this.context.testURLChange(e.target.value)} />
          <button onClick={() => this.context.loadTestURL()}>Load page</button><br />
          <Scraper />
        </Card>
        {this.context.whitelist ? (
          <React.Fragment>
            <Card>
              <h1>Management</h1><br/>
              Scrape URL: <input type="text" placeholder="URL" onChange={this.scrapeURLChange} />
              <button
                onClick={() => this.context.scrapeURL(this.state.tempScrapeURL)}>
                Scrape URL</button><br />
              {hosts.map((val, i) => (<div key={i}>
                <input
                  type='checkbox'
                  value={val.sourceID}
                  onClick={(e) => {
                    const { tempSelection } = this.state;
                    if (tempSelection.indexOf(e.target.value) > -1)
                      tempSelection.splice(tempSelection.indexOf(e.target.value), 1);
                    else
                      tempSelection.push(e.target.value);
                    this.setState({ ...this.state, tempSelection });
                  }}
                  defaultChecked={this.state.tempSelection.indexOf(val.sourceID) > -1} />
                {val.name}<br />
              </div>))}
              <button
                onClick={() => this.context.fetchNews(this.state.tempSelection)}>
              Scrape news sources</button>
              <h1>Schedule</h1>
            </Card>
            <Card>
              <h1>Statistics</h1>
              <p>{`Number of articles indexed: ${this.context.urlCount === -1 ? 'Loading...' : this.context.urlCount}`}</p>
              <p>{`Number of terms indexed: ${this.context.termCount === -1 ? 'Loading...' : this.context.termCount}`}</p>
            </Card>
          </React.Fragment>
        ) : ''}
      </div>
    </React.Fragment>;
  }
}

AdminPanel.contextType = AdminPanelContext;

export default AdminPanel;
