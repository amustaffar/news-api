// require supertest
const request = require("supertest");

// setup databases
const db = require("../db/connection");
const testData = require("../db/data/test-data");
const app = require("../app");
const seed = require("../db/seeds/seed");
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
    test("status 400: invalid query type (string instead of a number", () => {
      const objToPatch = { inc_votes: 30000 };
      return request(app)
        .patch("/api/articles/not-an-id")
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
    // testing for sort and order options - status 200
    const sortOptions = [
      "article_id",
      "title",
      "topic",
      "author",
      "created_at",
      "votes",
    ];
    const orderOptions = ["asc", "desc"];
    const jestOptionObj = {
      asc: { descending: false },
      desc: { descending: true },
    };

    for (const orderOption of orderOptions) {
      for (const sortOption of sortOptions) {
        test(`status 200 for ?sort_by=${sortOption}&order=${orderOption} returns the articles in the article table sorted as queried by users`, () => {
          return request(app)
            .get(`/api/articles?sort_by=${sortOption}&order=${orderOption}`)
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles.length).toBe(13);
              expect(articles).toBeSortedBy(
                sortOption,
                jestOptionObj[orderOption]
              );
            });
        });
      }
    }

    // testing for invalid sort options i.e. by "body" and "article_img_url" - status 400 - promise reject
    const sortOptionsInvalid = ["body", "article_img_url"];
    for (const orderOption of orderOptions) {
      for (const sortOption of sortOptionsInvalid) {
        test(`status 400 for ?sort_by=${sortOption}&order=${orderOption} when queried with unaccepted sorting (column) options`, () => {
          return request(app)
            .get(`/api/articles?sort_by=${sortOption}&order=${orderOption}`)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe("Bad request");
            });
        });
      }
    }

    test("status 400 when passed on invalid query", () => {
      return request(app)
        .get("/api/articles?sort_by=chaka_chaka_khan&order=yoyoyo")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
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

describe("/api/users", () => {
  describe("GET", () => {
    test("status 200 returns an array of user objects with username, name and avatar_url properties ", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(body.users.length).toBe(4);
          body.users.forEach((user) => {
            expect(user).toEqual({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});
