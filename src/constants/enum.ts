export enum UserVerifyStatus {
  Unverified, // chua xac thuc email
  Verified, // da xac thuc email
  Banned, // bi khoa
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForotPasswordToken,
  EmailVerifyToken,
}

export enum MediaType {
  Image,
  Video,
  HLS,
}

export enum MediaTypeQuery {
  Image = "Image",
  VIdeo = "Video",
}

export enum EncodingStatus {
  Pending, //Dang cho o hang doi
  Processing, // Dang endcode
  Success, // Encode thanh cong
  Failed, // Encode that bai
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet,
}

export enum TweetAudience {
  Everyone,
  TwitterCircle,
}

export enum PeopleFollow {
  Anyone = "0",
  Following = "1",
}
