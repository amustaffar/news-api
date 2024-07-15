const express = require("express");
const app = express();
const controllers = require("./controllers");

app.get("/api/topics", controllers.getTopics);

app.use((err, req, res, next) => {
  // for TypeError(500) - not explicitly tested
  next(err);
});

module.exports = app;
