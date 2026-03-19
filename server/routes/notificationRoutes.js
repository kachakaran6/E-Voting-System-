const express = require("express");
const { z } = require("zod");

const { authRequired } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/asyncHandler");
const { listNotifications, markRead } = require("../controllers/notificationController");

const router = express.Router();
router.use(authRequired);

router.get("/", asyncHandler(listNotifications));

router.post(
  "/:id/read",
  validate(
    z.object({
      body: z.object({}).optional(),
      params: z.object({ id: z.string().min(1) }),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(markRead)
);

module.exports = { notificationRoutes: router };

