const express = require("express");
const app = express();
const controllers = require("./controllers");

// endpoints from endpoints.json
const endpoints = require("./endpoints.json");

app.get("/api", (req, res, next) => {
  //console.log(endpoints);
  res.status(200).send({ endpoints });
});

app.get("/api/topics", controllers.getTopics);

app.use((err, req, res, next) => {
  // for TypeError(500) - not explicitly tested
  next(err);
});

module.exports = app;
