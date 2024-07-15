// requiresupertest
const request = require("supertest");

// setup databases
const db = require("../db/connection");
const testData = require("../db/data/test-data");
const app = require("../app");
const seed = require("../db/seeds/seed");

// seeding prior each test with test data
// db.end() after each test
beforeEach(() => seed(testData));
afterAll(() => db.end());

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
