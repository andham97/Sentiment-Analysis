import React, { Component } from 'react';
import Header from '../Header';
import Card from '../Card';
import { AdminPanelContext } from './AdminPanelStore';

class AdminPanel extends Component {
  componentWillMount() {
    this.context.getHosts();
  }

  render() {
    const { hosts } = this.context;
    return <React.Fragment>
      <Header name='Webscraper administrator tool' />
      <div className='Wrapper'>
        <Card>
          <ul>
            {hosts.length === 0 ? 'Loading hosts...' : hosts.map((host, i) => <li key={i}>
              <strong>{host.sourceID}</strong>:{host.hostnames.map((name, j) => `${j > 0 ? ',' : ''} ${name}`)}
            </li>)}
          </ul>
        </Card>
      </div>
    </React.Fragment>;
  }
}

AdminPanel.contextType = AdminPanelContext;

export default AdminPanel;
