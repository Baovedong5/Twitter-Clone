import { Router } from "express";

import { searchController } from "~/controllers/search.controllers";
import { searchValidator } from "~/middlewares/search.middlewares";
import { paginationValidator } from "~/middlewares/tweets.middlewares";
import {
  accessTokenValidator,
  verifiedUserValidator,
} from "~/middlewares/users.middlewares";
import { validate } from "~/utils/validation";
const searchRouter = Router();

searchRouter.get(
  "/",
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(searchValidator),
  validate(paginationValidator),
  searchController
);

export default searchRouter;
