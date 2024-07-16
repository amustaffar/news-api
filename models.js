const format = require("pg-format");
// there is already an index.js in the respective folder url
const db = require("./db/connection");

exports.selectTopics = (query) => {
  return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticlesById = (id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [id])
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.selectArticles = (query) => {
  const { sort_by = "created_at", order = "desc" } = query;
  const queryString = format(
    // never SELECT * for API -> dangerous
    `SELECT
      articles.author,
      articles.title,
      articles.article_id,
      articles.topic,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.comment_id) AS comment_count
    FROM articles LEFT JOIN comments
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY %I %s;`,
    sort_by,
    order
  );
  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};

exports.selectCommentsByArticleId = (id) => {
  return db
    .query(
      `SELECT comment_id,
    votes,
    created_at,
    author,
    body,
    article_id
    FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows;
    });
};

exports.insertCommentByArticleId = (comment, id) => {
  const { author, body } = comment;
  return db
    .query(
      `INSERT INTO comments
    (author, body, article_id)
    VALUES ($1, $2, $3)
    RETURNING *`,
      [author, body, id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
