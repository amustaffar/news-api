const { query } = require("express");
const models = require("./models");

exports.getTopics = (req, res, next) => {
  models
    .selectTopics(req.query)
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticlesById = (req, res, next) => {
  models
    .selectArticlesById(req.params.article_id)
    .then((article) => {
      // to catch the error here
      if (article) {
        res.status(200).send({ article });
      } else {
        res.status(404).send({
          msg: `No article found under article_id ${req.params.article_id}`,
        });
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  models
    .selectArticles(query)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  models
    .selectCommentsByArticleId(req.params.article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  models
    .insertCommentByArticleId(req.body, req.params.article_id)
    .then((comment) => {
      console.log(comment);
      res.status(201).send({ comment });
    })
    .catch(next);
};
