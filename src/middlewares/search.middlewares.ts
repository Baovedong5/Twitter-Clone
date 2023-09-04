import { checkSchema } from "express-validator";
import { MediaTypeQuery, PeopleFollow } from "~/constants/enum";

export const searchValidator = checkSchema(
  {
    content: {
      isString: {
        errorMessage: "Content must be string",
      },
    },
    media_type: {
      optional: true,
      isIn: {
        options: [Object.values(MediaTypeQuery)],
      },
      errorMessage: `Media type must be one of ${Object.values(
        MediaTypeQuery
      ).join(",")}`,
    },
    people_follow: {
      optional: true,
      isIn: {
        options: [Object.values(PeopleFollow)],
        errorMessage: "People follow must be 0 or 1",
      },
    },
  },
  ["query"]
);
