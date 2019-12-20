const path = require("path");
const webpack = require("webpack");
const express = require("express");
const config = require("./webpack.config-dev");
const PORT = 3030;

const app = express();
const compiler = webpack(config);

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  require("webpack-dev-middleware")(compiler, {
    publicPath: config.output.publicPath,
    hot: true
  })
);

app.use(require("webpack-hot-middleware")(compiler));

app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, function(err) {
  if (err) {
    return console.error(err);
  }

  console.log(`Listening at http://localhost:${PORT}/`);
});
