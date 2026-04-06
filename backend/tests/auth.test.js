const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const User = require("../src/models/User");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("Auth API", () => {
  test("should register initial admin", async () => {
    const response = await request(app).post("/api/auth/register-admin").send({
      name: "Main Admin",
      email: "admin@example.com",
      password: "Password123"
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.role).toBe("admin");
  });

  test("should login with valid credentials", async () => {
    await request(app).post("/api/auth/register-admin").send({
      name: "Main Admin",
      email: "admin@example.com",
      password: "Password123"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "Password123"
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe("admin@example.com");
  });
});
