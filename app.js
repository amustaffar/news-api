const express = require("express");
const app = express();
const controllers = require("./controllers");

// endpoints from endpoints.json
const endpoints = require("./endpoints.json");

// for posting and patching
app.use(express.json());

app.get("/api", (req, res, next) => {
  res.status(200).send({ endpoints });
});

app.get("/api/topics", controllers.getTopics);

app.get("/api/articles", controllers.getArticles);

app.get("/api/articles/:article_id", controllers.getArticlesById);

app.patch("/api/articles/:article_id", controllers.patchArticleById);

app.get(
  "/api/articles/:article_id/comments",
  controllers.getCommentsByArticleId
);

app.post(
  "/api/articles/:article_id/comments",
  controllers.postCommentByArticleId
);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  if (err.code === "22P02" || err.code === "23503") {
    res.status(400).send({ msg: "Bad request" });
  }
  // for TypeError(500) - not explicitly tested
  next(err);
});

module.exports = app;
