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
  console.log(req.params.article_id);
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
