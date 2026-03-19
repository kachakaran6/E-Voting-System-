const express = require("express");
const { z } = require("zod");

const { authRequired } = require("../middleware/auth");
const { roleRequired } = require("../middleware/roles");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  listElections,
  getElection,
  createElection,
  updateElection,
  pauseElection,
  resumeElection,
  endElectionEarly,
  deleteElection,
} = require("../controllers/electionController");

const router = express.Router();

router.use(authRequired);

router.get("/", asyncHandler(listElections));
router.get(
  "/:id",
  validate(
    z.object({
      body: z.object({}).optional(),
      params: z.object({ id: z.string().min(1) }),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(getElection)
);

router.post(
  "/",
  roleRequired("ADMIN", "SUPER_ADMIN"),
  validate(
    z.object({
      body: z.object({
        title: z.string().min(3).max(200),
        state: z.string().min(2).max(80),
        startDate: z.string().min(4),
        endDate: z.string().min(4),
      }),
      params: z.object({}).optional(),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(createElection)
);

router.put(
  "/:id",
  roleRequired("ADMIN", "SUPER_ADMIN"),
  validate(
    z.object({
      body: z.object({
        title: z.string().min(3).max(200).optional(),
        state: z.string().min(2).max(80).optional(),
        startDate: z.string().min(4).optional(),
        endDate: z.string().min(4).optional(),
      }),
      params: z.object({ id: z.string().min(1) }),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(updateElection)
);

router.post(
  "/:id/pause",
  roleRequired("ADMIN", "SUPER_ADMIN"),
  validate(z.object({ body: z.object({}).optional(), params: z.object({ id: z.string().min(1) }), query: z.object({}).optional() })),
  asyncHandler(pauseElection)
);

router.post(
  "/:id/resume",
  roleRequired("ADMIN", "SUPER_ADMIN"),
  validate(z.object({ body: z.object({}).optional(), params: z.object({ id: z.string().min(1) }), query: z.object({}).optional() })),
  asyncHandler(resumeElection)
);

router.post(
  "/:id/end-early",
  roleRequired("ADMIN", "SUPER_ADMIN"),
  validate(z.object({ body: z.object({}).optional(), params: z.object({ id: z.string().min(1) }), query: z.object({}).optional() })),
  asyncHandler(endElectionEarly)
);

router.delete(
  "/:id",
  roleRequired("ADMIN", "SUPER_ADMIN"),
  validate(z.object({ body: z.object({}).optional(), params: z.object({ id: z.string().min(1) }), query: z.object({}).optional() })),
  asyncHandler(deleteElection)
);

module.exports = { electionRoutes: router };

