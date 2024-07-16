// require supertest
const request = require("supertest");

// setup databases
// there is already an index.js in the respective folder url
const db = require("../db/connection");
const testData = require("../db/data/test-data");
const app = require("../app");
const seed = require("../db/seeds/seed");

//endpoints from endpoints.json
const endpoints = require("../endpoints.json");

// seeding prior each test with test data
// db.end() after each test
beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api", () => {
  describe("GET", () => {
    test("status 200 responds with a json detailing all available endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          // dynamically referring to objects from endpoints.json
          expect(body).toEqual({ endpoints });
        });
    });
  });
});

describe("/api/topics", () => {
  describe("GET", () => {
    test("status 200 returns an array of topic objects with slug and description properties ", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(body.topics.length).toBe(3);
          body.topics.forEach((topic) => {
            expect(topic).toEqual({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("status 200 returns an article object with the appropriate id", () => {
      return request(app)
        .get("/api/articles/3")
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual({
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: "2020-11-03T09:12:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    test("status 404 when passed a non-existant article id", () => {
      return request(app)
        .get("/api/articles/9999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No article found under article_id 9999");
        });
    });
    test("status 400 when passed a string as article id", () => {
      return request(app)
        .get("/api/articles/not-an-id")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
  });
  describe("PATCH", () => {
    test("status 201 responds with the updated article: article 3; votes increased by 30", () => {
      const objToPatch = { inc_votes: 30 };
      const objToReceive = {
        article_id: 3,
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: "2020-11-03T09:12:00.000Z",
        votes: 30,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .patch("/api/articles/3")
        .send(objToPatch)
        .expect(201)
        .then(({ body }) => {
          expect(body).toStrictEqual(objToReceive);
        });
    });
    test("status 404: id is not in the database", () => {
      const objToPatch = { inc_votes: 30 };
      return request(app)
        .patch("/api/articles/99999")
        .send(objToPatch)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not found");
        });
    });
    test("status 400: invalid inc_votes provided", () => {
      const objToPatch = { inc_votes: "fffffff" };
      return request(app)
        .patch("/api/articles/3")
        .send(objToPatch)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
  });
});

describe("/api/articles", () => {
  describe("GET", () => {
    test("status 200 returns all articles sorted by date in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
          body.articles.forEach((article) => {
            expect(article).toEqual({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(String),
            });
          });
        });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("status 200 returns an array of comments with correct properties, with the most recent comments first - article no. 3", () => {
      return request(app)
        .get("/api/articles/3/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(2);
          expect(body.comments).toBeSortedBy("created_at", {
            descending: true,
          });
          body.comments.forEach((comment) => {
            expect(comment).toEqual({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              votes: expect.any(Number),
              article_id: expect.any(Number),
            });
          });
        });
    });
    test("status 200 returns an array of comments with correct properties, with the most recent comments first - article no. 1", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(11);
          expect(body.comments).toBeSortedBy("created_at", {
            descending: true,
          });
          body.comments.forEach((comment) => {
            expect(comment).toEqual({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              votes: expect.any(Number),
              article_id: expect.any(Number),
            });
          });
        });
    });
    test("status 404 not found for an article with no comment present e.g. article no. 2", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not found");
        });
    });
    test("status 400 not found for an invalid id type (e.g. string)", () => {
      return request(app)
        .get("/api/articles/not-an-id/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("status 404 not found for a valid id type (number) but incorrect id number", () => {
      return request(app)
        .get("/api/articles/9999999/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not found");
        });
    });
  });
  describe("POST", () => {
    test("status 201 responds with the posted comment", () => {
      const objToPost = {
        author: "rogersop",
        body: "Not recommending this article",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(objToPost)
        .expect(201)
        .then(({ body }) => {
          expect(body.comment.body).toBe("Not recommending this article");
        });
    });
    test("status 400 not found an author as referenced in the users table", () => {
      const objToPost = {
        author: "chaka khan",
        body: "Not recommending this article",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(objToPost)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    // need to double check this one:
    test("status 400 bad request for a valid id type (number) but incorrect id number", () => {
      const objToPost = {
        author: "chaka khan",
        body: "Not recommending this article",
      };
      return request(app)
        .post("/api/articles/99999999/comments")
        .send(objToPost)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
  });
});

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
    test("status 204: no content status code indicates that the server has successfully fulfilled the request and there is no additional information to send back", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });
    test("status 404: not a valid id", () => {
      return request(app).delete("/api/comments/999999").expect(404);
    });
  });
});
