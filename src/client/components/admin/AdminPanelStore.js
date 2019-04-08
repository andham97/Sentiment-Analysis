import React from 'react';
import PropTypes from 'prop-types';

const AdminPanelContext = React.createContext();

class AdminPanelStore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hosts: [],
    };
    this.getHosts = this.getHosts.bind(this);
  }

  getHosts() {
    fetch('/api/ws').then(response => response.json()).then((data) => {
      const hosts = Object.keys(data).filter(key => key.indexOf('_') !== 0 && key !== 'type').reduce((acc, key) => {
        const selection = acc.filter(e => e.sourceID === data[key].sourceID);
        if (selection.length === 0) {
          const d = data[key];
          d.hostnames = [key];
          acc.push(d);
        }
        else
          selection[0].hostnames.push(key);
        return acc;
      }, []);
      this.setState({ ...this.state, hosts });
    });
  }

  render() {
    return (
      <AdminPanelContext.Provider value={{ ...this.state, getHosts: this.getHosts }}>
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
