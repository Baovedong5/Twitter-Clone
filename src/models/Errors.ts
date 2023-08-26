import httpStatus from "~/constants/httpStatus";
import { usersMessage } from "~/constants/messages";

type TErrors = Record<
  string,
  {
    msg: string;

    [key: string]: any;
  }
>;

export class ErrorWithStatus {
  message: string;
  status: number;
  constructor({ message, status }: { message: string; status: number }) {
    (this.message = message), (this.status = status);
  }
}

export class EntityError extends ErrorWithStatus {
  errors: TErrors;
  constructor({
    message = usersMessage.VALIDATION_ERROR,
    errors,
  }: {
    message?: string;
    errors: TErrors;
  }) {
    super({ message, status: httpStatus.UNPROCESSABLE_ENTITY });
    this.errors = errors;
  }
}
