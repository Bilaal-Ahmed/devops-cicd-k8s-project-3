const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("./server");

test("GET / returns application information", async () => {
  const response = await request(app).get("/");

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.message, "DevOps Project #3 is running!");
  assert.strictEqual(response.body.version, "1.0.0");
});

test("GET /health returns healthy status", async () => {
  const response = await request(app).get("/health");

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.status, "healthy");
});
