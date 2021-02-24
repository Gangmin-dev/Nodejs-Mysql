const http = require("http");
const fs = require("fs");
const url = require("url");
const qs = require("querystring");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const mysql = require("mysql");

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  // password는 별도의 파일로 분리해서 버전 관리에 포함 X
  password: "1234",
  database: "opentutorials",
});

db.connect();

const template = require("./lib/template.js");

var app = http.createServer((request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (queryData.id === undefined) {
      // fs.readdir("./data", (error, filelist) => {
      //   var title = "Welcome";
      //   var description = "Hello, Node.js";
      //   var list = template.list(filelist);
      //   var html = template.html(
      //     title,
      //     list,
      //     `<h2>${title}</h2>${description}`,
      //     `<a href="/create">create</a>`
      //   );
      //   response.writeHead(200);
      //   response.end(html);
      // });

      db.query("SELECT * FROM topic", (err, topics, fields) => {
        var title = "Welcome";
        var description = "Hello, Node.js";
        var list = template.list(topics);
        var html = template.html(
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    } else {
      /*
      fs.readdir("./data", (error, filelist) => {
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
          var title = queryData.id;
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description);
          var list = template.list(filelist);
          var html = template.html(
            title,
            list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            ` <a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
      */
      db.query(`SELECT * FROM topic`, (err, topics, fields) => {
        if (err) throw err;
        db.query(
          `SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,
          // ?에 치환되어 자동으로 들어감. 공격 의도 알아서 세탁
          [queryData.id],
          (err2, topic, fields) => {
            if (err2) throw err2;
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.html(
              title,
              list,
              `
              <h2>${title}</h2>
              ${description}
              <p>by ${topic[0].name}</p>
              `,
              ` <a href="/create">create</a>
                <a href="/update?id=${queryData.id}}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
          }
        );
      });
    }
  } else if (pathname === "/create") {
    /*
    fs.readdir("./data", (error, filelist) => {
      var title = "WEB - create";
      var list = template.list(filelist);
      var html = template.html(
        title,
        list,
        `
        <form action="/create_process" method="POST">
    <p></p><input type="text" name="title" placeholder="title"></p>
    <p>
        <textarea name="description" placeholder="description"></textarea>
    </p>
    <p><input type="submit"></p>
</form>
        `,
        ""
      );
      response.writeHead(200);
      response.end(html);
    });
    */

    db.query("SELECT * FROM topic", (err, topics, fields) => {
      db.query(`SELECT * FROM author`, (err2, authors) => {
        var title = "Create";
        var list = template.list(topics);
        var html = template.html(
          title,
          list,
          `
          <form action="/create_process" method="POST">
          <p></p><input type="text" name="title" placeholder="title"></p>
          <p>
              <textarea name="description" placeholder="description"></textarea>
          </p>
          ${template.authorSelect(authors)}
          <p><input type="submit"></p>
          </form>
          `,
          ""
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === "/create_process") {
    var body = "";
    request.on("data", (data) => {
      body = body + data;
    });
    request.on("end", () => {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      /*
      fs.writeFile(`data/${title}`, description, "utf8", (err) => {
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
      });
      */

      db.query(
        `INSERT INTO topic (title, description, created, author_id)
          VALUES(?, ?, NOW(), ?)`,
        [post.title, post.description, post.author],
        (err, result) => {
          if (err) throw err;
          response.writeHead(302, { Location: `/?id=${result.insertId}` });
          response.end();
        }
      );
    });
  } else if (pathname === "/update") {
    /*
    fs.readdir("./data", (error, filelist) => {
      fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
        var title = queryData.id;
        var list = template.list(filelist);
        var html = template.html(
          title,
          list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
    */
    db.query("SELECT * FROM topic", (err, topics, fields) => {
      if (err) throw err;
      db.query(
        `SELECT * FROM topic WHERE id=?`,
        [queryData.id],
        (err2, topic) => {
          if (err2) throw err2;
          db.query(`SELECT * FROM author`, (err3, authors) => {
            if (err3) throw err3;
            var list = template.list(topics);
            var html = template.html(
              topic[0].title,
              list,
              `
                <form action="/update_process" method="post">
                  <input type="hidden" name="id" value="${topic[0].id}">
                  <p><input type="text" name="title" placeholder="title" value="${
                    topic[0].title
                  }"></p>
                  <p>
                    <textarea name="description" placeholder="description">${
                      topic[0].description
                    }</textarea>
                  </p>
                  <p>
                    ${template.authorSelect(authors, topic[0].author_id)}
                  </p>
                  <p>
                    <input type="submit">
                  </p>
                </form>
                `,
              `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
            );
            response.writeHead(200);
            response.end(html);
          });
        }
      );
    });
  } else if (pathname === "/update_process") {
    var body = "";
    request.on("data", (data) => {
      body = body + data;
    });
    request.on("end", () => {
      var post = qs.parse(body);
      /*
      fs.rename(`data/${id}`, `data/${title}`, (error) => {
        fs.writeFile(`data/${title}`, description, "utf8", (err) => {
          response.writeHead(302, { Location: `/?id=${title}` });
          response.end();
        });
      });
      */

      db.query(
        `UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
        [post.title, post.description, post.author, post.id],
        (err, result) => {
          if (err) throw err;
          response.writeHead(302, { Location: `/?id=${post.id}` });
          response.end();
        }
      );
    });
  } else if (pathname === "/delete_process") {
    var body = "";
    request.on("data", (data) => {
      body = body + data;
    });
    request.on("end", () => {
      var post = qs.parse(body);
      /*
      fs.unlink(`data/${filteredId}`, (error) => {
        response.writeHead(302, { Location: `/` });
        response.end();
      });
      */

      db.query(`DELETE FROM topic WHERE id=?`, [post.id], (err, result) => {
        if (err) throw err;
        response.writeHead(302, { Location: `/` });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
