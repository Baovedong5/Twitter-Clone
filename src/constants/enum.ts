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
}
