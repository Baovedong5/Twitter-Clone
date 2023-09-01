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

export enum EncodingStatus {
  Pending, //Dang cho o hang doi
  Processing, // Dang endcode
  Success, // Encode thanh cong
  Failed, // Encode that bai
}
