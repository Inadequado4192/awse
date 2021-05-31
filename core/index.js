"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zedge = exports.goodfon = exports.pikabu = exports.wallpaperflare = exports.alphacoders = exports.getAnySite = void 0;
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
    constructor(url, images, timeout, pages) {
        this.url = url;
        this.images = images;
        this.timeout = timeout;
        this.pages = pages;
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
        return new Promise(async (resolve) => {
            function end(page) { resolve(new Data(url, images, new Date().getTime() - sTime, page - 1)); }
            this._get({
                end: end,
                images: images,
                minImages: options.minImages,
                pages: options.pages,
                sTime: sTime,
                search: options.search
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
            if (page > param.pages && param.images.size >= param.minImages)
                return param.end(page);
            let $ = cheerio.load(await getBody(this._searchURL(param.search.replace(/\s+/g, "%20"), page)));
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
            loadPage.apply(this, [++page]);
        }).apply(this, [1]);
    }
}
class LiveWeb extends Web {
    constructor(options) {
        super(options);
    }
    async _get(param) {
        (async function loadPage(page) {
            const $ = cheerio.load(await getBody(this._searchURL(param.search.replace(/\s+/g, "%20"), page)));
            let jItems = JSON.parse($("body").html()).items;
            for (let i of jItems) {
                if (!i.tags.includes("anime"))
                    continue;
                param.images.add(i.thumbUrl);
            }
            if ((page < param.pages) && jItems.length > 0)
                return await loadPage.apply(this, [++page]);
            else
                param.end(page + 1);
        }).apply(this, [1]);
    }
}
const alphacoders = new StaticWeb({
    url: "https://wall.alphacoders.com/",
    _imagePath: ".thumb-container-big > div.thumb-container > div.boxgrid > a > picture > img",
    _searchURL(tag, page) {
        return `${this.url}search.php?search=anime%20${tag || "art"}&quickload=0&page=${page}`;
    },
    _imageСheck(img) {
        return img.parentNode.parentNode.parentNode.next.next.children[1].children[3].children[0].data == "Anime";
    }
});
exports.alphacoders = alphacoders;
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
const zedge = new LiveWeb({
    url: "https://www.zedge.net/",
    _searchURL(tag, page) {
        return `https://www.zedge.net/api-zedge-web/browse/search?query=Anime%20${tag}&cursor=1%3AzyV1ag%3A${48 * (page - 1)}&section=search-wallpapers-Anime-${tag}&contentType=wallpapers`;
    }
});
exports.zedge = zedge;
function getAnySite(param) {
    let list = ["alphacoders", "wallpaperflare", "pikabu", "goodfon", "zedge"];
    return eval(list[Math.floor(Math.random() * list.length)]).get(param);
}
exports.getAnySite = getAnySite;
//# sourceMappingURL=index.js.map