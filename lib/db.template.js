// 버전 관리에 올리는 파일은 이것으로 한 후에, 서버 열 때
// 파일 복사해서 아이디 pW 넣고 사용

const mysql = require("mysql");

var db = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: "",
});

db.connect();

module.exports = db;
