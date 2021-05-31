const { getAnySite, alphacoders, wallpaperflare, pikabu, goodfon, zedge } = require("../core");

["alphacoders", "wallpaperflare", "pikabu", "goodfon", "zedge"].forEach(fn => {
    eval(fn).get({
        search: "Neko",
        pages: 10,
        minImages: 100
    }).then(d => console.log(fn, d.URLs.size, d.pages))
});

getAnySite({
    search: "Neko",
    pages: 1
}).then(d => console.log(d.URL, d.URLs.size, d.pages));

alphacoders.url