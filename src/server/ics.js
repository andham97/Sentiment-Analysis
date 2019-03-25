import NLUV1 from 'watson-developer-cloud/natural-language-understanding/v1';
import Cloudant from '@cloudant/cloudant';
import NP from 'newsapi';
import env from './app-env';

const nluParameters = env.getServiceCredentials('natural-language-understanding');
nluParameters.version = '2018-11-16';
nluParameters.iam_apikey = nluParameters.apikey;
const nlu = new NLUV1(nluParameters);

const cloudant = Cloudant({
  account: env.getServiceCredentials('cloudantNoSQLDB').username,
  plugins: [
    {
      iamauth: {
        iamApiKey: env.getServiceCredentials('cloudantNoSQLDB').apikey,
      },
    },
    {
      retry: {
        retryStatusCodes: [429],
        retryInitialDelayMsecs: 500,
      },
    },
  ],
});

const newsapi = new NP('8bb920aa355b41349e02c706ddb277b5');

export { nlu, cloudant, newsapi };
