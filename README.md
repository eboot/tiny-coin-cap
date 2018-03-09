# Tiny Coin Cap

https://tinycoincap.herokuapp.com

Minimal cryptocurrency market cap clone rendered server-side. Since no JavaScript is required, visitors can maintain their privacy a bit more. Data is cached in memory for 10 minutes using [node-cache](https://mpneuried.github.io/nodecache/) to respect Coin Market Cap's request limit.

Powered by [Coin Market Cap](https://coinmarketcap.com/api/). Inspired by [Legible News](https://legiblenews.com/).

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
* Start the server:
  * `yarn serve`