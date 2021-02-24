const mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  // password는 별도의 파일로 분리해서 버전 관리에 포함 X
  password: "1234",
  database: "opentutorials",
});

connection.connect();

connection.query("SELECT * FROM topic", (err, results, fields) => {
  if (err) throw err;
  console.log("The sol is : ", results);
});

connection.end();
