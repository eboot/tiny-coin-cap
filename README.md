# Tiny Coin Cap API

Proof of concept for an API using Node.js and Express that could query [Coin Market Cap's API](https://coinmarketcap.com/api/) while respecting their 10 minute request limit interval; caching results in memory using [node-cache](https://mpneuried.github.io/nodecache/).

## Develop Locally
* Clone the repository
* `cd` into the cloned directory
* Install tools:
	* [Node.js](https://nodejs.org/en/)
	* [yarn](https://yarnpkg.com/en/)
	* [npm-check-updates](https://github.com/tjunnone/npm-check-updates)
		* `yarn global add npm-check-updates`
	* [depcheck](https://www.npmjs.com/package/depcheck)
		* `yarn global add depcheck`
	* [snyk](https://snyk.io)
		* `yarn global add snyk`
* Install dependencies: 
	* `yarn`
* Start the server on `localhost:8000/api/`:
  * `yarn serve`
* Use a tool like [Postman](https://www.getpostman.com/) to query the api:
  * `http://localhost:8000/api/coins`