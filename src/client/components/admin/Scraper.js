import React, { Component } from 'react';
import { AdminPanelContext } from './AdminPanelStore';

/**
 * Month array
 * @type {Array<String>}
 */
const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'Desember'];

/**
 * @class Scraper
 * @extends Component
 */
class Scraper extends Component {
  render() {
    const { testPage, activeHost } = this.context;
    if (testPage === 1)
      return 'Loading page...';
    if (typeof testPage === 'string')
      return testPage;
    if (testPage) {
      let headline = 'Error';
      let body = 'Error';
      let date = 'Error';
      try {
        let text = '';
        if (activeHost.headlines.length > 0) {
          for (let i = 0; i < activeHost.headlines.length; i++) {
            text = testPage(activeHost.headlines[i]).text();
            if (text.length > 0)
              break;
          }
          if (text.length > 0)
            headline = text;
        }
        text = '';
        if (activeHost.body.length) {
          for (let i = 0; i < activeHost.body.length; i++) {
            let sub = testPage(activeHost.body[i]);
            activeHost.exclude.forEach((sel) => {
              sub = sub.not(sel);
            });
            text = sub.text();
            if (text.length > 0)
              break;
          }
          if (text.length > 0)
            body = text;
        }
        text = '';
        if (activeHost.date.fn !== '') {
          for (let i = 0; i < activeHost.date.sel.length; i++) {
            if (activeHost.date.sel[i].attr === '')
              text = testPage(activeHost.date.sel[i].sel).text();
            else
              text = testPage(activeHost.date.sel[i].sel).attr(activeHost.date.sel[i].attr);
            if (text.length > 0)
              break;
          }
          if (text.length > 0)
            date = eval(activeHost.date.fn)(text, months);
        }
      }
      catch (e) {
        console.log(e);
        if (!date)
          date = 'Error';
      }
      if (headline !== 'Error' || date !== 'Error' || body !== 'Error')
        return <React.Fragment>
          Headline: {headline}<br/>
          Date: {date ? date.toLocaleString() : date}<br />
          Main text:<br /><div className='scroll admin-scraper-body'>{body}</div>
        </React.Fragment>;
    }
    if (testPage && this.context.activeIndex === -1)
      return 'Page loaded, select a host or start creating a new definition';
    return '';
  }
}

Scraper.contextType = AdminPanelContext;

export default Scraper;
