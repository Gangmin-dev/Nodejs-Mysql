const mysql = require("mysql");

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  // id, password는 별도의 파일로 분리해서 버전 관리에 포함 X
  password: "1234",
  database: "opentutorials",
});

db.connect();

module.exports = db;
