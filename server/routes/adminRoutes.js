const express = require("express");
const { z } = require("zod");

const { authRequired } = require("../middleware/auth");
const { roleRequired } = require("../middleware/roles");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/asyncHandler");
const { listAdmins, createAdmin, deleteAdmin } = require("../controllers/adminController");

const router = express.Router();

router.use(authRequired, roleRequired("SUPER_ADMIN"));

router.get("/", asyncHandler(listAdmins));

router.post(
  "/",
  validate(
    z.object({
      body: z.object({
        fullName: z.string().min(2).max(120),
        email: z.string().email().max(200),
        password: z.string().min(8).max(200),
      }),
      params: z.object({}).optional(),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(createAdmin)
);

router.delete(
  "/:id",
  validate(
    z.object({
      body: z.object({}).optional(),
      params: z.object({ id: z.string().min(1) }),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(deleteAdmin)
);

module.exports = { adminRoutes: router };

