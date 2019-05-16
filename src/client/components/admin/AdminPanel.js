import React, { Component } from 'react';
import AceEditor from 'react-ace';
import brace from 'brace'; // eslint-disable-line no-unused-vars
import 'brace/mode/javascript';
import 'brace/theme/tomorrow';
import Alert from 'react-s-alert';
import '../style/AdminPanel.css';
import Header from '../Header';
import Card from '../Card';
import MultiListInput from './MultiListInput';
import { AdminPanelContext } from './AdminPanelStore';
import Scraper from './Scraper';
import Button from '../Button';

const sItemBoilerplate = {
  task: '',
  recurring: false,
  occurences: [],
};

const clone = o => JSON.parse(JSON.stringify(o));

class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tempScrapeURL: '',
      tempDateSel: '',
      tempDateAttr: '',
      tempSelection: [],
      tempSItem: clone(sItemBoilerplate),
      tempSItemShow: -1,
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
    this.context.getSchedule();
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
      <div className='wrapper admin'>
        <Card cName='scroll'>
          <ul>
            {hosts.length === 0 ? 'Loading hosts...' : hosts.map((host, i) => <li key={i}>
              <span onClick={this.selectHost(i).bind(this)}><strong>{host.sourceID}</strong>:{host.hostnames.map((name, j) => `${j > 0 ? ',' : ''} ${name}`)}</span>
            </li>)}
          </ul>
        </Card>
        <Card cName="admin-host-edit scroll">
          Name: <input placeholder='Source name' value={activeHost.name} onChange={e => this.context.updateActiveHost({ ...activeHost, name: e.target.value })} /><br />
          <MultiListInput
            title='Headline selectors'
            addButton='Add selector'
            emptyText='No selectors'
            newText='New selector'
            delButton='Delete'
            placeholder='Headline selector'
            propname='headlines'
            activeHost={activeHost}
            update={this.context.updateActiveHost} /><br />
          <MultiListInput
            title='Body selectors'
            addButton='Add selector'
            emptyText='No selectors'
            newText='New selector'
            delButton='Delete'
            placeholder='Body selector'
            propname='body'
            activeHost={activeHost}
            update={this.context.updateActiveHost} /><br />
          <MultiListInput
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
          <MultiListInput
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
            type='text'
            placeholder='Date selector'
            value={this.state.tempDateSel}
            onChange={this.dateSelChange} /><br />
          Attribute (optional)<input
            type='text'
            placeholder='Attribute name'
            value={this.state.tempDateAttr}
            onChange={this.dateAttrChange} />
          <button onClick={() => {
            activeHost.date.sel
              .push({ sel: this.state.tempDateSel, attr: this.state.tempDateAttr });
            this.setState({ ...this.state, tempDateSel: '', tempDateAttr: '' });
            this.context.updateActiveHost({ ...activeHost });
          }}>Add selector</button><br /><br />
          Validation URL: <input
            type='text'
            placeholder='Validation URL'
            value={activeHost.validationURL}
            onChange={(e) => {
              this.context.updateActiveHost({ ...activeHost, validationURL: e.target.value });
            }} /><br />
          <i>If using attribute, the value contained in the attribute will
            be passed to the date function instead of the text in the selected element.
            The element is selected with the CSS-selector above</i>
          <button onClick={() => this.context.saveHost()}>Save host</button>
          <button onClick={() => this.context.clearActiveHost()}>Clear fields</button>
        </Card>
        <Card cName='admin-editor-panel'>
          <AceEditor
            placeholder='Create function with signatur (date: string, months: array)'
            mode='javascript'
            theme='tomorrow'
            name='editor'
            onChange={code => this.context.updateActiveHost({
              ...activeHost,
              date: {
                ...activeHost.date,
                function: code,
              },
            })}
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
            className='admin-editor'
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
              <div className='scroll'>
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
              </div>
              <Button
                title='Scrape news sources'
                onClick={() => this.context.fetchNews(this.state.tempSelection, hosts
                  .filter(h => this.state.tempSelection.indexOf(h.sourceID) > -1)
                  .reduce((acc, h) => {
                    acc[h.sourceID] = h.name;
                    return acc;
                  }, {}))} />
              <h1>Statistics</h1>
              <p>{`Number of articles indexed: ${this.context.urlCount === -1 ? 'Loading...' : this.context.urlCount}`}</p>
            </Card>
            <Card cName='admin-schedule'>
              <h1>Schedule</h1>
              <div className='admin-add-sitem'>
                <MultiListInput
                  title='Occurences'
                  addButton='Add occurence'
                  emptyText='No occurences'
                  newText='New occurence (UTC)'
                  delButton='Delete'
                  placeholder='Occurence (hh:mm:ss)'
                  propname='occurences'
                  activeHost={this.state.tempSItem}
                  validate={(input) => {
                    const nums = input.split(':');
                    if (nums.length !== 3
                      || nums.filter(n => n.length !== 2 && n.length !== 1).length > 0
                      || nums.reduce((acc, val, i) => {
                        if (acc)
                          return acc;
                        return isNaN(val)
                          || Number(val) < 0
                          || Number(val) > (i === 0 ? 23 : 59);
                      }, false)) {
                      Alert.error('Occurence is invalid, use (hh:mm:ss) in the range 00:00:00 to 23:59:59', { position: 'top' });
                      return false;
                    }
                    return true;
                  }} /><br />
                  Time difference: {new Date().getHours() - new Date().getUTCHours()} hours<br />
                <h3>Select news sources for new job</h3>
                <div className='admin-add-sitem-list scroll'>
                  <input
                    type='checkbox'
                    onClick={(e) => {
                      this.setState({
                        ...this.state,
                        tempSItem: {
                          ...this.state.tempSItem,
                          task: e.target.checked ? 'all' : [...document.querySelectorAll('.admin-add-sitem input:checked')].map(item => item.value).join(','),
                        },
                      });
                    }} />
                    All sources<br />
                  {hosts.map((val, i) => (<div key={i}>
                    <input
                      disabled={this.state.tempSItem.task === 'all'}
                      type='checkbox'
                      value={val.sourceID}
                      onClick={(e) => {
                        const { tempSItem } = this.state;
                        const { checked, value } = e.target;
                        const task = tempSItem.task.split(',').filter(t => t !== '');
                        if (!checked && task.indexOf(value) > -1)
                          task.splice(task.indexOf(value), 1);
                        else if (checked && task.indexOf(value) === -1)
                          task.push(value);
                        this.setState({
                          ...this.state,
                          tempSItem: {
                            ...tempSItem,
                            task: task.join(','),
                          },
                        });
                      }} />
                    {val.name}
                    </div>))}
                  </div><br /><br />
                <input
                  type='checkbox'
                  onClick={({ target }) => {
                    this.setState({
                      ...this.state,
                      tempSItem: {
                        ...this.state.tempSItem,
                        recurring: target.checked,
                      },
                    });
                  }} /> Recurring job
                <Button
                  title='Add job'
                  onClick={() => {
                    const { tempSItem } = this.state;
                    tempSItem.occurences = tempSItem.occurences.map((occ) => {
                      const nums = occ.split(':');
                      return {
                        hour: Number(nums[0]),
                        minute: Number(nums[1]),
                        second: Number(nums[2]),
                      };
                    });
                    Alert.info('Adding job to schedule');
                    this.context.addScheduleItem(tempSItem);
                    this.setState({
                      ...this.state,
                      tempSItem: clone(sItemBoilerplate),
                    });
                  }} />
              </div>
              <div className='admin-show-sitem scroll'>
                <ul>
                  {this.context.scheduleItems.map((item, i) => <li key={i} onClick={() => {
                    this.setState({
                      ...this.state,
                      tempSItemShow: this.state.tempSItemShow === i ? -1 : i,
                    });
                  }}>
                    Sources to fetch: {item.task}, recurring: {item.recurring ? 'true' : 'false'}
                    {this.state.tempSItemShow === i
                      ? <React.Fragment>
                        <ul>
                          {item.occurences.map((occ, j) => <li key={j}>
                            {occ.hour < 10 ? `0${occ.hour}` : occ.hour}:
                            {occ.minute < 10 ? `0${occ.minute}` : occ.minute}:
                            {occ.second < 10 ? `0${occ.second}` : occ.second}
                          </li>)
                          }
                        </ul>
                        <Button
                          title='Remove job'
                          onClick={() => {
                            Alert.info('Removing job from schedule');
                            this.context.deleteScheduleItem(item.id);
                          }
                        } />
                      </React.Fragment>
                      : ''
                    }
                  </li>)}
                </ul>
              </div>
            </Card>
          </React.Fragment>
        ) : ''}
      </div>
    </React.Fragment>;
  }
}

AdminPanel.contextType = AdminPanelContext;

export default AdminPanel;
