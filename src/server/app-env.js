import cfenv from 'cfenv';
import fs from 'fs';

const appEnv = cfenv.getAppEnv();
let serviceParameters;
console.log(process.env);
console.log(appEnv);
if (appEnv.isLocal) {
  serviceParameters = JSON.parse(fs.readFileSync('.ibm-credentials', 'utf8'));
}
else {
  serviceParameters = appEnv.services;
}

export default {
  getService: service => serviceParameters[service],
  getServiceCredentials: (service, index) => serviceParameters[service][index || 0].credentials,
  isLocal: appEnv.isLocal,
};
