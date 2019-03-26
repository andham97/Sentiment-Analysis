import React from 'react';
import { render } from 'enzyme';

import App from '../../src/client/App';

describe('Test App component', () => {
  it('should render a simple div', () => {
    const app = render(<App />);
    expect(app.find('.add_filter').length).toBe(1);
  });
});
