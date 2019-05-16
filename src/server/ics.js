/**
 * @module Cloud services
 */
import NLUV1 from 'watson-developer-cloud/natural-language-understanding/v1';
import Cloudant from '@cloudant/cloudant';
import NP from 'newsapi';
import env from './app-env';

/**
 * Credentials for NLU
 * @type {Object}
 */
const nluParameters = env.getServiceCredentials('natural-language-understanding');
nluParameters.version = '2018-11-16';
nluParameters.iam_apikey = nluParameters.apikey;

/**
 * NLU instance
 * @type {NLU}
 */
const nlu = new NLUV1(nluParameters);

/**
 * Is cloudant connected
 * @type {Boolean}
 */
let cloudantReady = false;

/**
 * Cloudant conntection instance
 * @type {Cloudant}
 */
let cloudant;
const connectCloudant = () => {
  cloudantReady = false;
  cloudant = Cloudant({
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
};

connectCloudant();

/**
 * NewsAPI instance
 * @type {NP}
 */
const newsapi = new NP(env.getServiceCredentials('newsapi').apikey);

/**
 * Get the current cloudant instance
 * @name getCloudant
 * @return {Cloudant} Cloudant instance if initialized
 *
 * @example
 * getCloudant();
 */
const getCloudant = () => (cloudantReady ? cloudant : undefined);
export {
  nlu, getCloudant, newsapi, connectCloudant,
};
