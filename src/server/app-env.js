import cfenv from 'cfenv';
import fs from 'fs';

const appEnv = cfenv.getAppEnv();
let serviceParameters;
if (appEnv.isLocal) {
  if (process.env.isTravis) {
    serviceParameters = {
      cloudantNoSQLDB: [
        {
          credentials: {
            apikey: process.env.cloudantNoSQLDB_apikey,
            username: process.env.cloudantNoSQLDB_username,
          },
        },
      ],
      'natural-language-understanding': [
        {
          credentials: {
            apikey: process.env.nlu_apikey,
          },
        },
      ],
      newsapi: [
        {
          credentials: {
            apikey: process.env.np_apikey,
          },
        },
      ],
    };
  }
  else
    serviceParameters = JSON.parse(fs.readFileSync('.ibm-credentials', 'utf8'));
}
else {
  serviceParameters = appEnv.services;
}

console.log(serviceParameters);

export default {
  getService: service => serviceParameters[service],
  getServiceCredentials: (service, index) => serviceParameters[service][index || 0].credentials,
  isLocal: appEnv.isLocal,
};
