# What is this?

Getting anime wallpapers from websites.
> List of available websites: `alphacoders`, `wallpaperflare`, `pikabu`, `goodfon`


[![npm Package](https://img.shields.io/badge/npm-v1.4.0-blue?style=for-the-badge&logo=appveyor)](https://www.npmjs.org/package/awse) [![License](https://img.shields.io/badge/license-ISC-green?style=for-the-badge&logo=appveyor)](https://github.com/Inadequado4192/awse/blob/master/LICENSE) [![Language](https://img.shields.io/badge/Language-JS%2FTS-yellowgreen?style=for-the-badge&logo=appveyor)](https://www.npmjs.com/package/awse)

# Installation

`npm i awse --save`

## How to use?

To get started, export the site you need or several at once.
```js
const { Alphacoders, wallpaperflare, pikabu, goodfon } = require("awse");
```
Or use the `getAnySite` function. It performs a `get` function on a random site instance.
```js
const { getAnySite } = require("awse");
```
# Usage example

```js
pikabu.get({
    search: "Neko",
    pages: 1
}).then(d => console.log(d.url, d.images, d.pages, d.timeout));
console.log(pikabu.url) // Link to website (https://pikabu.ru/)
```
```js
getAnySite({
    search: "Black Clover",
    pages: 2,
    minImages: 100
}).then(d => console.log(d.url, d.images, d.pages, d.timeout));
```

# Parameters of the `get(options)` function

* **options** `:object` - search options:
  * **search** `:string` - the tag by which the search is performed.
  * **pages** `:number` - __(optional)__ the number of pages to read (Default to 1). The number may increase if the number of images found is less for `minImages`
  * **minImages** `:number` - __(optional)__ the minimum number of images to read (Default to 0).

# The result of executing the `get` function

The result of execution will be `Promise <Data>`.
`Data` - Contains data received from the site:
* ### Properties:
  * **url** `:string` - Link to website.
  * **sources** `:Set<string>` - An array of links from which the images were searched for.
  * **images** `:Set<string>` - List of image images.
  * **timeout** `:number` - Function execution time.
  * **pages** `:number` - Number of pages viewed.
* ### Methods:
  * **randomRange([range])**  `:string[]` -  Selects random images from the list.