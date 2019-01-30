import React from 'react';
import { render } from 'enzyme';

import App from '../../src/client/App';

describe('Test App component', () => {
  it('should render a simple div', () => {
    expect(render(<App />).text()).toBe('App');
  });
});
