// include mysql module
var mysql = require('mysql');
 
// create a connection variable with the details required
var con = mysql.createConnection({
  host: "localhost",    // ip address of server running mysql
  user: "root",    // user name to your mysql database
  password: "password",  // corresponding password
  database: "recipies"
});
 
// connect to the database.
con.connect(function(err) {
  if (err) throw err;
    const query = "SELECT * FROM users"
    con.query(query, (err, result, fields) => {
    if (err) throw err
      console.log(result);
  })
  
});

con.connect()

module.exports = con;