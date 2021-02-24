const db = require("./db.js");
const qs = require("querystring");
const template = require("./template.js");

exports.home = (request, response) => {
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
};

exports.page = (request, response, queryData) => {
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
};

exports.create = (request, response) => {
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
};

exports.create_process = (request, response) => {
  var body = "";
  request.on("data", (data) => {
    body = body + data;
  });
  request.on("end", () => {
    var post = qs.parse(body);
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
};

exports.update = (request, response, queryData) => {
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
};

exports.update_process = (request, response) => {
  var body = "";
  request.on("data", (data) => {
    body = body + data;
  });
  request.on("end", () => {
    var post = qs.parse(body);
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
};

exports.delete_process = (request, response) => {
  var body = "";
  request.on("data", (data) => {
    body = body + data;
  });
  request.on("end", () => {
    var post = qs.parse(body);
    db.query(`DELETE FROM topic WHERE id=?`, [post.id], (err, result) => {
      if (err) throw err;
      response.writeHead(302, { Location: `/` });
      response.end();
    });
  });
};
