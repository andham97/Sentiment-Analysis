/**
 * @module Application enviroment
 */
import cfenv from 'cfenv';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

/**
 * Cloud Foundry enviroment
 * @type {Object}
 */
const appEnv = cfenv.getAppEnv();

/**
 * Service parameters for cloudant, NLU, NewsAPI
 *
 * @type {Object}
 */
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
  serviceParameters.newsapi = [{
    credentials: {
      apikey: process.env.np_apikey,
    },
  }];
}

export default {
  getService: service => serviceParameters[service],
  getServiceCredentials: (service, index) => serviceParameters[service][index || 0].credentials,
  isLocal: appEnv.isLocal,
};
