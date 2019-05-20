# Sentiment-Analysis
[![Build Status](https://travis-ci.org/andham97/Sentiment-Analysis.svg?branch=master)](https://travis-ci.org/andham97/Sentiment-Analysis)
[![codecov](https://codecov.io/gh/andham97/Sentiment/branch/master/graph/badge.svg)](https://codecov.io/gh/andham97/Sentiment)

## Documentation
The documentation for the project can be found: [client](https://andham97.github.io/Sentiment-Analysis/client/index.html) and [server](https://andham97.github.io/Sentiment-Analysis/server/index.html)

## Installation guide
Make sure you run atleast node version 10.
In the root directory the files `.env` and `.ibm-credentials` need to be present. The structure for these files are as follows
### .ibm-credentials
```json
{
  "cloudantNoSQLDB": [
    {
      "credentials": {
        "apikey": "<insert-apikey>",
        "username": "<insert-username>"
      }
    }
  ],
  "natural-language-understanding": [
    {
      "credentials": {
        "apikey": "<insert-apikey>"
      }
    }
  ],
  "newsapi": [
    {
      "credentials": {
        "apikey": "<insert-apikey>"
      }
    }
  ]
}
```
### .env
```bash
AUTH0_DOMAIN=<auth-domain>
AUTH0_CLIENT_ID=<auth0-client-id>
AUTH0_CLIENT_SECRET=<auth0-client-secret>
AUTH0_CALLBACK_URL=<auth0-callback-url>
SESSION_SECRET=<express-session-secret>
SCRAPER_API_KEY=<web-scraper-api-key>
ADMIN_WHITELIST=<comma-separated-list-of-admin-emails>
SCHEDULE=<include-if-server-should-run-scheduler [value=true]>
```

To build and run the server execute the following scripts
```bash
$ npm install
$ npm run build
$ npm start
```
