const { getAnySite, alphacoders, wallpaperflare, pikabu, goodfon } = require("../core");

["alphacoders", "wallpaperflare", "pikabu", "goodfon"].forEach(fn => {
    eval(fn).get({
        search: "",
        pages: 10,
        minImages: 100
    }).then(d => console.log(fn, d.images.size, d.pages))
});