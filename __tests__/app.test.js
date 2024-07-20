// require supertest
const request = require("supertest");

// setup databases
const db = require("../db/connection");
const testData = require("../db/data/test-data");
const app = require("../app");
const seed = require("../db/seeds/seed");
const endpoints = require("../endpoints.json");

// seeding/ending for each test
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
  describe("POST", () => {
    test("status 201 returns a topic object constaining the newly added topic", () => {
      const objToPost = {
        slug: "grooming",
        description: "unisex beauty regime",
      };
      return request(app)
        .post("/api/topics")
        .send(objToPost)
        .expect(201)
        .then(({ body }) => {
          expect(body.topic).toEqual({
            slug: "grooming",
            description: "unisex beauty regime",
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
            comment_count: "2",
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

  // ON DELETE CASCADE in seed.js to remove all associated comments
  describe("DELETE", () => {
    test("status 204: no content status code indicates that the server has successfully fulfilled the request and there is no additional information to send back", () => {
      return request(app).delete("/api/articles/1").expect(204);
    });
    test("status 404: not a valid id", () => {
      return request(app).delete("/api/comments/999999").expect(404);
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
          expect(body.articles.length).toBe(10);
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

    // reconsider these "batch testing"
    for (const orderOption of orderOptions) {
      for (const sortOption of sortOptions) {
        test(`status 200 for ?sort_by=${sortOption}&order=${orderOption} returns the articles in the article table sorted as queried by users`, () => {
          return request(app)
            .get(`/api/articles?sort_by=${sortOption}&order=${orderOption}`)
            .expect(200)
            .then(({ body: { articles } }) => {
              expect(articles.length).toBe(10);
              expect(articles).toBeSortedBy(
                sortOption,
                jestOptionObj[orderOption]
              );
            });
        });
      }
    }
    test("status 200 returns articles with the correct pagination", () => {
      return request(app)
        .get("/api/articles?topic=mitch&limit=10&page=1")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
        });
    });
    test("status 400 when passed on invalid query", () => {
      return request(app)
        .get("/api/articles?sort_by=chaka_chaka_khan&order=yoyoyo")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("status 200 and returns articles filtered by the topic value - 'cats' and other sort options", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=desc&topic=cats")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(1);
        });
    });
    test("status 200 and returns articles filtered by the topic value - 'mitch' and return the count of all articles unbounded by pagination query", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.total).toBe(12);
        });
    });
  });
  describe("POST", () => {
    test("status 201 an article posted and returned the article plus some other properties", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "rogersop",
          title: "the house of the dragon",
          body: "the civil war between house targaryen also known as the dance of the dragon",
          topic: "cats",
          article_img_url: "http.miow-miow.com",
        })
        .expect(201)
        .then(({ body }) => {
          expect(body.article).toEqual({
            article_id: 14,
            title: "the house of the dragon",
            topic: "cats",
            author: "rogersop",
            body: "the civil war between house targaryen also known as the dance of the dragon",
            created_at: expect.any(String),
            votes: 0,
            article_img_url: "http.miow-miow.com",
            comment_count: "0",
          });
        });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("status 200 returns an array of comments with correct properties, with the most recent comments first - article no. 1", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=4&page=1")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(4);
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
    test("status 404 for page number 0 returns SQL exception - article no. 1", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=4&page=0")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Page number must start from 1 not 0");
        });
    });
    test("status 200 returns an array of comments with correct properties, with the most recent comments first - article no. 1", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(10);
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
  describe("PATCH", () => {
    test("status 201 responds with the updated comment: comment_id = 4; votes decreased by 25 to -125", () => {
      const objToPatch = { inc_votes: -25 };
      const objToReceive = {
        comment_id: 4,
        body: " I carry a log — yes. Is it funny to you? It is not to me.",
        article_id: 1,
        author: "icellusedkars",
        created_at: "2020-02-23T12:01:00.000Z",
        votes: -125,
      };
      return request(app)
        .patch("/api/comments/4")
        .send(objToPatch)
        .expect(201)
        .then(({ body }) => {
          expect(body).toStrictEqual(objToReceive);
        });
    });
    test("status 404: id is not in the database", () => {
      const objToPatch = { inc_votes: 30 };
      return request(app)
        .patch("/api/comments/99999")
        .send(objToPatch)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not found");
        });
    });
    test("status 400: invalid inc_votes provided", () => {
      const objToPatch = { inc_votes: "fffffff" };
      return request(app)
        .patch("/api/comments/3")
        .send(objToPatch)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("status 400: invalid query type (string instead of a number", () => {
      const objToPatch = { inc_votes: 30000 };
      return request(app)
        .patch("/api/comments/not-an-id")
        .send(objToPatch)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
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

describe("/api/users/:username", () => {
  describe("GET", () => {
    test("status 200 returns a user object", () => {
      const objToReceive = {
        username: "rogersop",
        name: "paul",
        avatar_url:
          "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
      };
      return request(app)
        .get("/api/users/rogersop")
        .expect(200)
        .then(({ body }) => {
          //console.log(body);
          expect(body.user).toStrictEqual(objToReceive);
        });
    });
    test("status 404 for non-existing username", () => {
      return request(app)
        .get("/api/users/chakakhan")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No user found under username chakakhan");
        });
    });
  });
});
