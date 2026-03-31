const express = require("express");
const { z } = require("zod");

const { authRequired } = require("../middleware/auth");
const { roleRequired } = require("../middleware/roles");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/asyncHandler");
const { confirmVote, getReceipt, listUserVotes } = require("../controllers/voteController");

const router = express.Router();
router.use(authRequired);

router.post(
  "/confirm",
  roleRequired("VOTER"),
  validate(
    z.object({
      body: z.object({
        electionId: z.string().min(1),
        candidateId: z.string().min(1),
        confirm: z.boolean(),
      }),
      params: z.object({}).optional(),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(confirmVote)
);

router.get(
  "/history",
  roleRequired("VOTER"),
  asyncHandler(listUserVotes)
);

router.get(
  "/receipt/:receiptId",
  validate(
    z.object({
      body: z.object({}).optional(),
      params: z.object({ receiptId: z.string().min(3) }),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(getReceipt)
);

module.exports = { voteRoutes: router };

