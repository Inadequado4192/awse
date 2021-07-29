import request from "then-request";
import * as cheerio from "cheerio";

function getBody(url: string) {
    return new Promise((resolve: (body: string) => void, reject: (reason?: any) => void) => {
        request("GET", url).done(function (res) {
            // if (res.statusCode >= 300) reject(new Error(`Server responded with status code ${res.statusCode}`));
            resolve(res.body.toString("utf8"));
        });
    });
}

/**Contains data received from the site.*/
class Data {
    /**Link to website.*/         public url: string;
    /**An array of links from which the images were searched for.*/ public sources: Set<string>;
    /**List of image URLs.*/      public images: Set<string>;
    /**Function execution time.*/ public timeout: number;
    /**Number of pages viewed.*/  public pages: number;
    constructor(url: string, images: Set<string>, timeout: number, pages: number, sources: Set<string>) {
        this.url = url; this.images = images; this.timeout = timeout; this.pages = pages; this.sources = sources;
    };
    /**Selects random images from the list.
     * @returns URL
     */
    public randomRange(range: number = 1): string[] {
        let a: string[] = [];
        let copy = Array.from(this.images);
        for (let i = 0; i < range && copy.length > 0; i++) {
            let u = copy[Math.floor(Math.random() * copy.length)];
            if (!a.includes(u)) a.push(u);
            else ++range;
            copy.splice(copy.indexOf(u), 1);
        }
        return a;
    }
}

type OptionsWeb = {
    url: string,
    _searchURL: (tag: string, page: number) => string
}
type OptionsGet = {
    search: string,
    pages?: number,
    minImages?: number
}
type ParamGet = {
    end: (page: number) => void,
    images: Set<string>,
    sources: Set<string>,
    sTime: number,
    search: string,
    pages: number,
    minImages: number
}

abstract class Web {
    /**Link to website*/
    public url: string;
    protected _searchURL: (tag: string, page: number) => string;
    public constructor(options: OptionsWeb) {
        this.url = options.url;
        this._searchURL = options._searchURL;
    }
    /**
     * Searches for images from a site with the specified parameters.
     * @async
     * @param options Search options.
     * 
     * "search" - the tag by which the search is performed.
     *
     * "pages" - (optional) the number of pages to read (Default to 1). The number may increase if the number of images found is less for "minImages"
     *
     * "minImages" - (optional) the minimum number of images to read (Default to 0).
     *
     * @returns Promise<Data>
     * @example
     *  alphacoders.get({
            search: "Neko",
            pages: 2,
            minImages: 40
        }).then(console.log);
    */
    public get(options: OptionsGet): Promise<Data> {
        if (!options) throw TypeError(`The "options" parameter is not specified.`);
        if ((!options.search && options.search !== "") || typeof options.search !== "string") throw TypeError(`Missing "search" argument in parameters`);
        if (!options.pages || options.pages < 0) options.pages = 1;
        if (!options.minImages || options.minImages < 0) options.minImages = 0;

        let sTime = new Date().getTime();
        let images = new Set<string>();
        let url = this.url;
        let sources = new Set<string>();
        return new Promise(async (resolve: (value: Data) => void) => {
            function end(page: number) { resolve(new Data(url, images, new Date().getTime() - sTime, page - 1, sources)); }
            this._get({
                end: end,
                images: images,
                minImages: options.minImages,
                sources: sources,
                pages: options.pages,
                sTime: sTime,
                search: options.search
            } as ParamGet);
        });
    }
    protected abstract _get(param: ParamGet): Promise<any>;
}
class StaticWeb extends Web {
    private _imagePath: string;
    private _imageСheck?: (img: cheerio.Element) => boolean;
    constructor(options: OptionsWeb & {
        _imagePath: string,
        _imageСheck?(img: cheerio.Element): boolean
    }) {
        super(options);
        this._imageСheck = options._imageСheck;
        this._imagePath = options._imagePath;
    }
    protected async _get(param: ParamGet) {
        let _IU: string;
        (async function loadPage(this: StaticWeb, page: number): Promise<void> {
            const _continue = () => loadPage.apply(this, [++page]);
            // console.log(page > param.pages && param.images.size >= param.minImages);
            if (page > param.pages && param.images.size >= param.minImages) return param.end(page);
            let url = this._searchURL(param.search.replace(/\s+/g, "%20"), page);
            param.sources.add(url);
            let $ = cheerio.load(await getBody(url));
            // write($);
            // console.log(this._searchURL(options.search.replace(/\s+/g, "%20"), page));

            let images = Array.from($(this._imagePath));
            if (images.length < 1) return param.end(page);
            let imagesA = images.filter(i => (this._imageСheck || (() => true))(i as cheerio.Element));

            if (($("head title")[0] && ($("head title")[0].children[0] as any).data.includes("ERROR 404"))) return param.end(page);

            for (let i of imagesA) param.images.add((<cheerio.Element>i).attribs.src || (<cheerio.Element>i).attribs["data-src"]);
            if (imagesA[0]) {
                let fSRC = (<cheerio.Element>imagesA[0]).attribs.src || (<cheerio.Element>imagesA[0]).attribs["data-src"];
                if (fSRC == _IU) return param.end(page);
                _IU = fSRC;
            }

            _continue();
            // loadPage.apply(this, [++page]);
        }).apply(this, [1]);
    }
}
class LiveWeb extends Web {
    constructor(options: OptionsWeb) {
        super(options);
    }
    protected async _get(param: ParamGet) {
        (async function loadPage(this: LiveWeb, page: number): Promise<void> {
            const $ = cheerio.load(await getBody(this._searchURL(param.search.replace(/\s+/g, "%20"), page)));
            let jItems = JSON.parse($("body").html() as string).items;
            for (let i of jItems) {
                if (!i.tags.includes("anime")) continue;
                param.images.add(i.thumbUrl);
            }
            if ((page < param.pages) && jItems.length > 0) return await loadPage.apply(this, [++page]);
            else param.end(page + 1);
        }).apply(this, [1]);
    }
}

// const write = ($: cheerio.CheerioAPI) => require("fs-extra").writeFile("./test/test.html", $.html());

/**
 * An instance of the class for working with images from the site https://wall.alphacoders.com/
 * Up to 30 posts per page
 */
const alphacoders = new StaticWeb({
    url: "https://wall.alphacoders.com/",
    _imagePath: ".thumb-container-big > div.thumb-container > div.boxgrid > a > picture > img",
    _searchURL(tag: string, page: number): string {
        // `${this.url}by_sub_category.php?id=173173&name=Naruto+Wallpapers`;
        // `${this.url}by_sub_category.php?id=333944&name=Genshin+Impact+Wallpapers`;
        return `${this.url}search.php?search=${tag || "art"}&page=${page}`;
    },
    // _imageСheck(img) {
    //     return (<any>img).parentNode.parentNode.parentNode.next.next.children[1].children[3].children[0].data == "Anime";
    // }
});

/**
 * An instance of the class for working with images from the site https://www.wallpaperflare.com/
 * Up to 80 posts per page
 */
const wallpaperflare = new StaticWeb({
    url: "https://www.wallpaperflare.com/",
    _imagePath: "#gallery > li > figure > a > img",
    _searchURL(tag: string, page: number): string {
        return `${this.url}search?wallpaper=Anime%20${tag}${page == 1 ? "" : `&page=${page}`}`;
    },
    _imageСheck(img) {
        let b: boolean = false;
        let tags = ["anime", "catgirl", "cat girl", "loli", "woman", "nekopara", "neko para"];
        for (let tag of tags) {
            if ((<any>img).parentNode.next.next.children[0].data.toLowerCase().includes(tag)) {
                b = true;
                break;
            }
        }
        return b;
    }
});

/**
 * An instance of the class for working with images from the site https://pikabu.ru/
 * Average 10 posts per page
 */
const pikabu = new StaticWeb({
    url: "https://pikabu.ru/",
    _imagePath: "article.story .story-image__content img",
    _searchURL(tag, page) {
        return `${this.url}tag/Anime%20Art/hot?q=${tag}&t=Anime&page=${page}&n=4`;
    }
});

/**
 * An instance of the class for working with images from the site https://www.goodfon.ru/.
 * Up to 24 posts per page.
 * @warning Lots of explicit content. Non-anime content present.
 */
const goodfon = new StaticWeb({
    url: "https://www.goodfon.ru/",
    _imagePath: ".wallpapers__item .wallpapers__item__img",
    _searchURL(tag, page) {
        return `${this.url}search/?q=Anime%20${tag}&page=${page}`;
    }
});

//#region pinterest
// /**
//  * An instance of the class for working with images from the site https://www.pinterest.co.kr/
//  */
// const pinterest = new LiveWeb({
//     url: "https://www.pinterest.co.kr/",
//     _imagePath: "div.Yl-.MIw.Hb7 div.XiG.sLG.zI7.iyn.Hsu > div:nth-child(1) > a > div > div.zI7.iyn.Hsu > div > div > div > div > div > *"
// });
//#endregion pinterest

/**
 * An instance of the class for working with images from the site https://www.zedge.net/.
 * Up to 48 posts per page.
 * 
 * He will find art for almost any request :)
 */
// const zedge = new LiveWeb({
//     url: "https://www.zedge.net/",
//     _searchURL(tag, page) {
//         return `https://www.zedge.net/api-zedge-web/browse/search?query=Anime%20${tag}&cursor=1%3AzyV1ag%3A${48 * (page - 1)}&section=search-wallpapers-Anime-${tag}&contentType=wallpapers`
//     }
// });

/**Function for working with images from any of the available sites.
 * @example
 * 

 * getAnySite({
 *     search: "Neko",
 *     pages: 1
 * }).then(console.log);
 */
function getAnySite(param: OptionsGet): Promise<Data> {
    let list = ["alphacoders", "wallpaperflare", "pikabu", "goodfon"];
    return (eval(list[Math.floor(Math.random() * list.length)]) as Web).get(param);
}

export { getAnySite, alphacoders, wallpaperflare, pikabu, goodfon };