const express = require("express");
const { z } = require("zod");

const { authRequired } = require("../middleware/auth");
const { roleRequired } = require("../middleware/roles");
const { validate } = require("../middleware/validate");
const { makeMappedUploader } = require("../middleware/upload");
const { asyncHandler } = require("../utils/asyncHandler");
const { listCandidates, createCandidate, updateCandidate, deleteCandidate } = require("../controllers/candidateController");

const router = express.Router();
router.use(authRequired);

router.get(
  "/",
  validate(
    z.object({
      body: z.object({}).optional(),
      params: z.object({}).optional(),
      query: z.object({ electionId: z.string().min(1).optional() }),
    })
  ),
  asyncHandler(listCandidates)
);

const upload = makeMappedUploader({
  fieldToSubdir: {
    candidateImage: "candidates",
    partyLogo: "party",
  },
});
const multiUpload = upload.fields([
  { name: "candidateImage", maxCount: 1 },
  { name: "partyLogo", maxCount: 1 },
]);

router.post(
  "/",
  roleRequired("ADMIN", "SUPER_ADMIN"),
  multiUpload,
  validate(
    z.object({
      body: z.object({
        candidateName: z.string().min(2).max(120),
        partyName: z.string().min(2).max(120),
        state: z.string().min(2).max(80),
        electionId: z.string().min(1),
      }),
      params: z.object({}).optional(),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(createCandidate)
);

router.put(
  "/:id",
  roleRequired("ADMIN", "SUPER_ADMIN"),
  multiUpload,
  validate(
    z.object({
      body: z.object({
        candidateName: z.string().min(2).max(120).optional(),
        partyName: z.string().min(2).max(120).optional(),
      }),
      params: z.object({ id: z.string().min(1) }),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(updateCandidate)
);

router.delete(
  "/:id",
  roleRequired("ADMIN", "SUPER_ADMIN"),
  validate(
    z.object({
      body: z.object({}).optional(),
      params: z.object({ id: z.string().min(1) }),
      query: z.object({}).optional(),
    })
  ),
  asyncHandler(deleteCandidate)
);

module.exports = { candidateRoutes: router };

