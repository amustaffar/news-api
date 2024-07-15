const { selectTopics } = require("./models");

exports.getTopics = (req, res, next) => {
  selectTopics(req.query)
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};
