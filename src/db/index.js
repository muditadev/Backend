// const { Pool } = require("pg");
// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "mudita",
//   password: "123",
//   port: 5432,
// });

// module.exports = {
//   query: (text, params) => pool.query(text, params),
// };

const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});
pool.connect((err) => {
  if (err) throw err;
  console.log("Connect to PostgreSQL successfully!");
});
module.exports = {
  query: (text, params) => pool.query(text, params),
};
