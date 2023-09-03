import { ParamsDictionary, Query } from "express-serve-static-core";

import { TweetAudience, TweetType } from "~/constants/enum";
import { Media } from "../Other";

export interface TweetReqBody {
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_id: null | string;
  hashtags: string[];
  mentions: string[];
  medias: Media[];
}

export interface TweetParam extends ParamsDictionary {
  tweet_id: string;
}

export interface TweetQuery extends Query {
  limit: string;
  page: string;
  tweet_type: string;
}

export interface Pagination {
  limit: string;
  page: string;
}
