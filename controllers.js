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

exports.postTopic = (req, res, next) => {
  models
    .insertTopic(req.body)
    .then((topic) => res.status(201).send({ topic }))
    .catch(next);
};

exports.getArticlesById = (req, res, next) => {
  models
    .selectArticlesById(req.params.article_id)
    .then((article) => {
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
  Promise.all([
    models.selectArticles(req.query),
    models.countArticles(req.query),
  ])
    .then(([articles, total]) => {
      res.status(200).send({ articles, total });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  models
    .selectCommentsByArticleId(req.query, req.params.article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  models
    .insertCommentByArticleId(req.body, req.params.article_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleById = (req, res, next) => {
  models
    .updateArticleById(req.body.inc_votes, req.params.article_id)
    .then((article) => {
      if (article === undefined) {
        res.status(404).send({ msg: "Not found" });
      } else {
        res.status(201).send(article);
      }
    })
    .catch(next);
};

exports.deleteCommentByCommentId = (req, res, next) => {
  models.removeCommentByCommentId(req.params.comment_id).then((deleted) => {
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).send({ msg: "Not found" });
    }
  });
};

exports.getUsers = (req, res, next) => {
  models
    .selectUsers(req.query)
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUsersById = (req, res, next) => {
  models
    .selectUsersById(req.params.username)
    .then((user) => {
      if (user) {
        res.status(200).send({ user });
      } else {
        res
          .status(404)
          .send({ msg: `No user found under username ${req.params.username}` });
      }
    })
    .catch(next);
};

exports.patchCommentById = (req, res, next) => {
  models
    .updateCommentById(req.body.inc_votes, req.params.comment_id)
    .then((comment) => {
      if (comment === undefined) {
        res.status(404).send({ msg: "Not found" });
      } else {
        res.status(201).send(comment);
      }
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  models
    .insertArticle(req.body)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.deleteArticleByArticleId = (req, res, next) => {
  models.removeArticleByArticleId(req.params.article_id).then((deleted) => {
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).send({ msg: "Not found" });
    }
  });
};
