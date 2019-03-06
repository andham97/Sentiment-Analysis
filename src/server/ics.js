import NLUV1 from 'watson-developer-cloud/natural-language-understanding/v1';
import Cloudant from '@cloudant/cloudant';
import env from './app-env';

const nluParameters = env.getServiceCredentials('natural-language-understanding');
nluParameters.version = '2018-11-16';
nluParameters.iam_apikey = nluParameters.apikey;
const nlu = new NLUV1(nluParameters);

const cloudant = Cloudant({
  account: env.getServiceCredentials('cloudantNoSQLDB').username,
  plugins: {
    iamauth: {
      iamApiKey: env.getServiceCredentials('cloudantNoSQLDB').apikey,
    },
  },
});

export { nlu, cloudant };
