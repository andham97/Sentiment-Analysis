import React, { Component } from 'react';
import { AdminPanelContext } from './AdminPanelStore';

const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'Desember'];

class Scraper extends Component {
  render() {
    const { testPage, activeHost } = this.context;
    if (testPage === 1)
      return 'Loading page...';
    if (testPage) {
      let headline = 'Error';
      let body = 'Error';
      let date = 'Error';
      try {
        if (activeHost.headline !== '')
          headline = testPage(activeHost.headline).text();
        if (activeHost.body !== '')
          body = testPage(activeHost.body).text();
        if (activeHost.date.function !== '')
          date = eval(activeHost.date.function)(testPage(activeHost.date.sel).text(), months);
      }
      catch (e) {
        if (!date)
          date = 'Error';
      }
      return <React.Fragment>
        Headline: {headline}<br/>
        Date: {date ? date.toLocaleString() : date}<br />
        Main text: {body}
      </React.Fragment>;
    }
    if (testPage && this.context.activeIndex === -1)
      return 'Page loaded, select a host';
    return '';
  }
}

Scraper.contextType = AdminPanelContext;

export default Scraper;
