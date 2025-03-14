const http = require("http");
const url = require("url");
const topic = require("./lib/topic.js");
const author = require("./lib/author.js");

var app = http.createServer((request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (queryData.id === undefined) {
      topic.home(request, response);
    } else {
      topic.page(request, response, queryData);
    }
  } else if (pathname === "/create") {
    topic.create(request, response);
  } else if (pathname === "/create_process") {
    topic.create_process(request, response);
  } else if (pathname === "/update") {
    topic.update(request, response, queryData);
  } else if (pathname === "/update_process") {
    topic.update_process(request, response);
  } else if (pathname === "/delete_process") {
    topic.delete_process(request, response);
  } else if (pathname === "/author") {
    author.home(request, response);
  } else if (pathname === "/author/create_process") {
    author.create_process(request, response);
  } else if (pathname === "/author/update") {
    author.create_process(request, response, queryData);
  } else if (pathname === "/author/update_process") {
    author.create_process(request, response);
  } else if (pathname === "/author/delete_process") {
    author.create_process(request, response);
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
