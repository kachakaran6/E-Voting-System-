const express = require("express");
const { z } = require("zod");

const { authRequired } = require("../middleware/auth");
const { roleRequired } = require("../middleware/roles");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/asyncHandler");
const { dashboard, electionStats } = require("../controllers/monitoringController");

const router = express.Router();
router.use(authRequired, roleRequired("ADMIN", "SUPER_ADMIN"));

router.get("/dashboard", asyncHandler(dashboard));
router.get(
  "/elections/:electionId",
  validate(
    z.object({
      body: z.object({}).optional(),
      params: z.object({ electionId: z.string().min(1) }),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(electionStats)
);

module.exports = { monitoringRoutes: router };

