const { getAnySite, wallpaperflare, pikabu, goodfon, Alphacoders } = require("../core");

// ["alphacoders", "wallpaperflare", "pikabu", "goodfon"].forEach(fn => {
//     eval(fn).get({
//         search: "",
//         pages: 10,
//         minImages: 10
//     }).then(d => console.log(fn, d.images.size, d.pages))
// });


// alphacoders.get({
//     search: "Genshin Impact",
//     type: "PC"
// }).then(console.log);

Alphacoders.get({
    search: "sdgfd",
    type: "PC",
    pages: 3
}).then(console.log);