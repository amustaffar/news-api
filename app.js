const cors = require("cors");
const express = require("express");
const app = express();
const controllers = require("./controllers");
const endpoints = require("./endpoints.json");

app.use(cors());

app.use(express.json());

app.get("/api", (req, res, next) => {
  res.status(200).send({ endpoints });
});

app.get("/api/topics", controllers.getTopics);

app.post("/api/topics", controllers.postTopic);

app.get("/api/articles", controllers.getArticles);

app.post("/api/articles", controllers.postArticle);

app.get("/api/articles/:article_id", controllers.getArticlesById);

app.delete("/api/articles/:article_id", controllers.deleteArticleByArticleId);

app.patch("/api/articles/:article_id", controllers.patchArticleById);

app.get(
  "/api/articles/:article_id/comments",
  controllers.getCommentsByArticleId
);

app.post(
  "/api/articles/:article_id/comments",
  controllers.postCommentByArticleId
);

app.delete("/api/comments/:comment_id", controllers.deleteCommentByCommentId);

app.patch("/api/comments/:comment_id", controllers.patchCommentById);

app.get("/api/users", controllers.getUsers);

app.get("/api/users/:username", controllers.getUsersById);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  if (err.code === "22P02" || err.code === "23503") {
    res.status(400).send({ msg: "Bad request" });
  }
  if (err.code === "2201X") {
    res.status(404).send({ msg: "Page number must start from 1 not 0" });
  }
  next(err);
});

module.exports = app;

// to do:
// reorganise endpoints - express router
// reorganise controllers
// reorganise models
