const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require("./api/routes/routes.js")(app);

const server = app.listen(3000, () => {
    console.log("Listening on port %s...", server.address().port);
});

