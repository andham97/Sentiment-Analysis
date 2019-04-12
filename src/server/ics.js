import NLUV1 from 'watson-developer-cloud/natural-language-understanding/v1';
import Cloudant from '@cloudant/cloudant';
import NP from 'newsapi';
import env from './app-env';

const nluParameters = env.getServiceCredentials('natural-language-understanding');
nluParameters.version = '2018-11-16';
nluParameters.iam_apikey = nluParameters.apikey;
const nlu = new NLUV1(nluParameters);

let cloudantReady = false;
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
}, (err) => {
  if (!err)
    cloudantReady = true;
});

const newsapi = new NP(env.getServiceCredentials('newsapi').apikey);

const getCloudant = () => (cloudantReady ? cloudant : undefined);

export { nlu, getCloudant, newsapi };
