const format = require("pg-format");
// there is already an index.js in the respective folder url
const db = require("./db/connection");

exports.selectTopics = (query) => {
  return db.query(`SELECT slug, description FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticlesById = (id) => {
  return db
    .query(
      `SELECT
      articles.article_id,
      articles.title,
      articles.topic,
      articles.author,
      articles.body,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.comment_id) AS comment_count
      FROM articles LEFT JOIN comments
      ON articles.article_id = comments.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id;`,
      [id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.selectArticles = (query) => {
  const { sort_by = "created_at", order = "desc", topic } = query;

  const acceptedOrderValues = ["asc", "desc"];
  const acceptedSortValues = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
  ];

  if (
    !acceptedOrderValues.includes(order) ||
    !acceptedSortValues.includes(sort_by)
  ) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  const queryString = format(
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
    ${topic ? `WHERE articles.topic = $1` : ""}
    GROUP BY articles.article_id
    ORDER BY %I %s `,
    sort_by,
    order
  );

  const params = topic ? [topic] : [];

  return db.query(queryString, params).then(({ rows }) => {
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

exports.updateArticleById = (inc_votes, id) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
      [inc_votes, id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeCommentByCommentId = (id) => {
  return (
    db
      .query(`DELETE FROM comments WHERE comment_id = $1`, [id])
      // return a promised boolean if the deletion was successful
      .then(({ rowCount }) => rowCount === 1)
  );
};

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users;`).then(({ rows }) => {
    return rows;
  });
};
