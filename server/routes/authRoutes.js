const express = require("express");
const { z } = require("zod");

const { validate } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimits");
const { authRequired } = require("../middleware/auth");
const { makeUploader } = require("../middleware/upload");
const { asyncHandler } = require("../utils/asyncHandler");
const { login, registerVoter, me, sendOtp, forgotPassword, resetPassword } = require("../controllers/authController");

const router = express.Router();

const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(2).max(120),
    password: z.string().min(6).max(200),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const registerSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(2).max(120),
      email: z.string().email().max(200),
      password: z.string().min(8).max(200),
      confirmPassword: z.string().min(8).max(200),
      voterId: z.string().min(3).max(50),
      state: z.string().min(2).max(80),
      otp: z.string().length(6),
    })
    .refine((v) => v.password === v.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

router.post("/login", authLimiter, validate(loginSchema), asyncHandler(login));
router.post("/register", authLimiter, validate(registerSchema), asyncHandler(registerVoter));
router.post("/send-otp", authLimiter, asyncHandler(sendOtp));
router.post("/forgot-password", authLimiter, asyncHandler(forgotPassword));
router.post("/reset-password", authLimiter, asyncHandler(resetPassword));
router.get("/me", authRequired, asyncHandler(me));

module.exports = { authRoutes: router };

