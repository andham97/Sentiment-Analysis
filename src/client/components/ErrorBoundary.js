import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(error);
    console.error(info);
  }

  render() {
    if (this.state.hasError) {
      return (<React.Fragment>
        <h1>Something went wrong.</h1>
        {JSON.stringify(this.state.error, null, 2)}
      </React.Fragment>);
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.any,
};

export default ErrorBoundary;
