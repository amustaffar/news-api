const format = require("pg-format");
const db = require("./db/connection");

exports.selectTopics = (query) => {
  return db.query(`SELECT slug, description FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.insertTopic = (topic) => {
  const { slug, description } = topic;
  return db
    .query(
      `INSERT INTO topics (slug, description)
      VALUES ($1, $2)
      RETURNING *`,
      [slug, description]
    )
    .then(({ rows }) => {
      return rows[0];
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

// get ("/api/articles") - count of all returned articles
exports.countArticles = (query) => {
  const { topic } = query;

  const params = topic ? [topic] : [];
  const queryString = `
    SELECT COUNT(article_id)::INT AS count
    FROM articles
    ${topic ? "WHERE topic = $1" : ""}
  `;

  return db.query(queryString, params).then(({ rows }) => {
    return rows[0].count;
  });
};

// get ("/api/articles") - return all articles with pagination
exports.selectArticles = (query) => {
  const {
    sort_by = "created_at",
    order = "desc",
    limit = 10,
    page = 1,
    topic,
  } = query;
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

  const offset = (page - 1) * limit;
  const offsetParam = topic ? "$2" : "$1";
  const limitParam = topic ? "$3" : "$2";

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
    ORDER BY %I %s
    OFFSET ${offsetParam} ROWS FETCH NEXT ${limitParam} ROWS ONLY;`,
    sort_by,
    order
  );

  const params = topic ? [topic, offset, limit] : [offset, limit];

  return db.query(queryString, params).then(({ rows }) => {
    return rows;
  });
};

exports.selectCommentsByArticleId = (query, id) => {
  const { limit = 10, page } = query;
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
    ORDER BY created_at DESC
    OFFSET (($2 - 1) * $3) ROWS FETCH NEXT $3 ROWS ONLY;`,
      [id, page, limit]
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

exports.selectUsersById = (id) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1;`, [id])
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.updateCommentById = (inc_votes, id) => {
  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`,
      [inc_votes, id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.insertArticle = (article) => {
  const { author, title, body, topic, article_img_url = "url" } = article;
  return db
    .query(
      `INSERT INTO articles
      (author,
      title,
      body,
      topic,
      article_img_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING article_id;`,
      [author, title, body, topic, article_img_url]
    )
    .then(({ rows }) => {
      return exports.selectArticlesById(rows[0].article_id);
    });
};

exports.removeArticleByArticleId = (id) => {
  return db
    .query(`DELETE FROM articles WHERE article_id = $1`, [id])
    .then(({ rowCount }) => rowCount === 1);
};
