const { getAnySite, Alphacoders, wallpaperflare, pikabu, goodfon } = require("../core");

// ["Alphacoders", "wallpaperflare", "pikabu", "goodfon"].forEach(fn => {
//     eval(fn).get({
//         search: "",
//         pages: 10,
//         minImages: 10
//     }).then(d => console.log(fn, d.images.size, d.pages))
// });


Alphacoders.get({
    search: "123"
}).then(console.log);