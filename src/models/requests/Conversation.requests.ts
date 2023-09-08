import { ParamsDictionary } from "express-serve-static-core";
export interface GetConversationsParam extends ParamsDictionary {
  receiver_id: string;
}
