// const format = require("pg-format");
// there is already an index.js in the respective folder url
const db = require("./db/connection");

exports.selectTopics = (query) => {
  const queryString = `SELECT * FROM topics;`;
  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};
