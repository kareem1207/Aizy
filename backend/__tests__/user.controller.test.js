// backend/__tests__/user.controller.test.js
const { createUser, getUser } = require("../controllers/user.controller");
const { prisma } = require("../config/prisma.config");

// Mock prisma
jest.mock("../config/prisma.config", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("User Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "customer",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("createUser should create a new user", async () => {
    // Mock user creation
    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.create.mockResolvedValue({
      id: "123",
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User created successfully",
      })
    );
  });
});
