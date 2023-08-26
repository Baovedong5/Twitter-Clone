import express from "express";
import { validationResult, ValidationChain } from "express-validator";
import { RunnableValidationChains } from "express-validator/src/middlewares/schema";
import httpStatus from "~/constants/httpStatus";
import { EntityError, ErrorWithStatus } from "~/models/Errors";

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (
  validation: RunnableValidationChains<ValidationChain>
) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    await validation.run(req);
    const errors = validationResult(req);
    //Neu khong co loi thi next
    if (errors.isEmpty()) {
      return next();
    }

    const errorsObject = errors.mapped();

    const entityErros = new EntityError({ errors: {} });

    for (const key in errorsObject) {
      const { msg } = errorsObject[key];
      //Tra ve loi khong phai do validate
      if (
        msg instanceof ErrorWithStatus &&
        msg.status !== httpStatus.UNPROCESSABLE_ENTITY
      ) {
        return next(msg);
      }
      entityErros.errors[key] = errorsObject[key];
    }

    next(entityErros);
  };
};
