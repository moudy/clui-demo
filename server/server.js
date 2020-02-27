const express = require('express');
const webpack = require('./webpack');
const graphql = require('./graphql');

const server = express();

webpack(server);
graphql(server);

const html = () => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>CLUI Demo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
    <link href="http://github.com/yrgoldteeth/darkdowncss/raw/master/darkdown.css" rel="stylesheet"></link>
    <link href="https://fonts.googleapis.com/css?family=Inconsolata&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script src="/public/main.js"></script>
  </body>
</html>
`;

server.get('/', (__, res) => {
  res.send(html());
});

module.exports = server;
