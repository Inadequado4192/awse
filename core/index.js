"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goodfon = exports.pikabu = exports.wallpaperflare = exports.Alphacoders = exports.getAnySite = void 0;
const then_request_1 = require("then-request");
const cheerio = require("cheerio");
function getBody(url) {
    return new Promise((resolve, reject) => {
        then_request_1.default("GET", url).done(function (res) {
            resolve(res.body.toString("utf8"));
        });
    });
}
class Data {
    constructor(url, images, timeout, pages, sources) {
        this.url = url;
        this.images = images;
        this.timeout = timeout;
        this.pages = pages;
        this.sources = sources;
    }
    ;
    randomRange(range = 1) {
        let a = [];
        let copy = Array.from(this.images);
        for (let i = 0; i < range && copy.length > 0; i++) {
            let u = copy[Math.floor(Math.random() * copy.length)];
            if (!a.includes(u))
                a.push(u);
            else
                ++range;
            copy.splice(copy.indexOf(u), 1);
        }
        return a;
    }
}
class Web {
    constructor(options) {
        this.url = options.url;
        this._searchURL = options._searchURL;
    }
    get(options) {
        if (!options)
            throw TypeError(`The "options" parameter is not specified.`);
        if ((!options.search && options.search !== "") || typeof options.search !== "string")
            throw TypeError(`Missing "search" argument in parameters`);
        if (!options.pages || options.pages < 0)
            options.pages = 1;
        if (!options.minImages || options.minImages < 0)
            options.minImages = 0;
        let sTime = new Date().getTime();
        let images = new Set();
        let url = this.url;
        let sources = new Set();
        return new Promise(async (resolve) => {
            function end(page) { resolve(new Data(url, images, new Date().getTime() - sTime, page - 1, sources)); }
            this._get({
                end: end,
                images: images,
                minImages: options.minImages,
                sources: sources,
                pages: options.pages,
                sTime: sTime,
                search: options.search,
                type: options.type
            });
        });
    }
}
class StaticWeb extends Web {
    constructor(options) {
        super(options);
        this._imageСheck = options._imageСheck;
        this._imagePath = options._imagePath;
    }
    async _get(param) {
        let _IU;
        (async function loadPage(page) {
            const _continue = () => loadPage.apply(this, [++page]);
            if (page > param.pages && param.images.size >= param.minImages)
                return param.end(page);
            let url = this._searchURL(param.search.replace(/\s+/g, "%20"), page, param.type);
            param.sources.add(url);
            let $ = cheerio.load(await getBody(url));
            let images = Array.from($(this._imagePath));
            if (images.length < 1)
                return param.end(page);
            let imagesA = images.filter(i => (this._imageСheck || (() => true))(i));
            if (($("head title")[0] && $("head title")[0].children[0].data.includes("ERROR 404")))
                return param.end(page);
            for (let i of imagesA)
                param.images.add(i.attribs.src || i.attribs["data-src"]);
            if (imagesA[0]) {
                let fSRC = imagesA[0].attribs.src || imagesA[0].attribs["data-src"];
                if (fSRC == _IU)
                    return param.end(page);
                _IU = fSRC;
            }
            _continue();
        }).apply(this, [1]);
    }
}
const write = ($) => require("fs-extra").writeFile("./test/test.html", $.html());
const wallpaperflare = new StaticWeb({
    url: "https://www.wallpaperflare.com/",
    _imagePath: "#gallery > li > figure > a > img",
    _searchURL(tag, page) {
        return `${this.url}search?wallpaper=Anime%20${tag}${page == 1 ? "" : `&page=${page}`}`;
    },
    _imageСheck(img) {
        let b = false;
        let tags = ["anime", "catgirl", "cat girl", "loli", "woman", "nekopara", "neko para"];
        for (let tag of tags) {
            if (img.parentNode.next.next.children[0].data.toLowerCase().includes(tag)) {
                b = true;
                break;
            }
        }
        return b;
    }
});
exports.wallpaperflare = wallpaperflare;
const pikabu = new StaticWeb({
    url: "https://pikabu.ru/",
    _imagePath: "article.story .story-image__content img",
    _searchURL(tag, page) {
        return `${this.url}tag/Anime%20Art/hot?q=${tag}&t=Anime&page=${page}&n=4`;
    }
});
exports.pikabu = pikabu;
const goodfon = new StaticWeb({
    url: "https://www.goodfon.ru/",
    _imagePath: ".wallpapers__item .wallpapers__item__img",
    _searchURL(tag, page) {
        return `${this.url}search/?q=Anime%20${tag}&page=${page}`;
    }
});
exports.goodfon = goodfon;
function getAnySite(param) {
    let list = ["Alphacoders", "wallpaperflare", "pikabu", "goodfon"];
    return eval(list[Math.floor(Math.random() * list.length)]).get(param);
}
exports.getAnySite = getAnySite;
function checkOptions(o) {
    if (!o)
        throw TypeError(`The "options" parameter is not specified.`);
    if ((!o.search && o.search !== "") || typeof o.search !== "string")
        throw TypeError(`Missing "search" argument in parameters`);
    if (!o.pages || o.pages < 0)
        o.pages = 1;
    if (!o.minImages || o.minImages < 0)
        o.minImages = 0;
    if (!o.type)
        o.type = "Mobile";
    if (!o.by)
        o.by = "by sub category";
    return o;
}
async function getContent(url) {
    return cheerio.load(await getBody(url));
}
function getImages($, path) {
    return Array.from($(path)).map(i => i.attribs.src || i.attribs["data-src"]);
}
const const_by = ["by sub category", "by collection"];
var Alphacoders;
(function (Alphacoders) {
    Alphacoders.url = "https://wall.alphacoders.com/";
    function get(_o) {
        const options = checkOptions(_o);
        return new Promise((resolve, reject) => {
            let sTime = new Date().getTime();
            let images = new Set();
            let sources = new Set();
            let _end = false;
            function end(page) { _end = true; resolve(new Data(Alphacoders.url, images, new Date().getTime() - sTime, page - 1, sources)); }
            (async function loadPage(page) {
                if ((page > options.pages && images.size >= options.minImages) || _end)
                    return end(page);
                let url = `https://wall.alphacoders.com/search.php?search=${options.search.replace(/\s+/g, "%20")}`;
                let $ = await getContent(url);
                const id_request = $(`meta[property="og:url"]`).attr("content")?.match(/id=(\d+)/)?.[1];
                if (id_request === undefined)
                    options.type = "PC";
                let _images;
                let path;
                if (id_request) {
                    switch (options.type) {
                        case "PC":
                            url = `https://wall.alphacoders.com/${options.by?.replace(/\s/g, "_")}.php?id=${id_request}&page=${page}`;
                            path = ".thumb-container-big > div.thumb-container > div.boxgrid > a > picture > img";
                            break;
                        case "Mobile":
                            url = `https://mobile.alphacoders.com/${options.by?.replace(/\s/g, "-")}/${id_request}?page=${page}`;
                            path = ".item a img";
                            break;
                        default: throw Error(`Unknown type "${options.type}"`);
                    }
                }
                else
                    path = ".thumb-container-big > div.thumb-container > div.boxgrid > a > picture > img";
                $ = await getContent(url);
                _images = getImages($, path);
                if (_images.length < 1)
                    return end(page);
                _images.forEach(url => { if (images.has(url)) {
                    console.log("forEach");
                    end(page);
                } ; });
                for (let url of _images)
                    images.add(url);
                sources.add(url);
                loadPage(++page);
            })(1);
        });
    }
    Alphacoders.get = get;
})(Alphacoders || (Alphacoders = {}));
exports.Alphacoders = Alphacoders;
//# sourceMappingURL=index.js.map