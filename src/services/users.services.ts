import { ObjectId } from "mongodb";
import { TokenType, UserVerifyStatus } from "~/constants/enum";
import { usersMessage } from "~/constants/messages";
import databaseService from "~/database/database";
import {
  RegisterReqBody,
  UpdateMeReqBody,
} from "~/models/requests/User.requests";
import RefreshToken from "~/models/schemas/RefreshToken.schemas";
import User from "~/models/schemas/User.schemas";
import { hashPassword } from "~/utils/bcrypt";
import { signToken } from "~/utils/jwt";

class UserService {
  private signAccessToken({
    user_id,
    verify,
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify,
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPRIES,
      },
    });
  }

  private signRefreshToken({
    user_id,
    verify,
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify,
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPRIES,
      },
    });
  }

  private signEmail_Verify_Token({
    user_id,
    verify,
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify,
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPRIES,
      },
    });
  }

  private signForgotPasswordToken({
    user_id,
    verify,
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForotPasswordToken,
        verify,
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPRIES,
      },
    });
  }

  private signAccessAndRefreshToken({
    user_id,
    verify,
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify }),
    ]);
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId();
    const email_verify_token = await this.signEmail_Verify_Token({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified,
    });
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token: email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
      })
    );

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified,
    });

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    );

    console.log("email_verify_token: ", email_verify_token);

    return {
      access_token,
      refresh_token,
    };
  }

  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email });
    return Boolean(result);
  }

  async login({
    user_id,
    verify,
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified,
    });
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
      })
    );
    return {
      access_token,
      refresh_token,
    };
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token });
    return {
      message: usersMessage.LOGOUT_SUCCESS,
    };
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({
        user_id,
        verify: UserVerifyStatus.Verified,
      }),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            email_verify_token: "",
            verify: UserVerifyStatus.Verified,
            // updated_at: new Date(),
          },
          $currentDate: {
            updated_at: true,
          },
        }
      ),
    ]);

    const [access_token, refresh_token] = token;

    return {
      access_token,
      refresh_token,
    };
  }

  async resendVerifyEmail(user_id: string) {
    //Gia bo gui email
    const email_verify_token = await this.signEmail_Verify_Token({
      user_id,
      verify: UserVerifyStatus.Unverified,
    });
    console.log("resend verify email: ", email_verify_token);

    //Cap nhat lai gia tri email_verify_token
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { email_verify_token },
        $currentDate: {
          updated_at: true,
        },
      }
    );
    return {
      message: usersMessage.RESEND_VERIRY_EMAIL_SUCCESS,
    };
  }

  async forgotPassword({
    user_id,
    verify,
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify,
    });
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token,
        },
        $currentDate: {
          updated_at: true,
        },
      }
    );
    //Gui email kem duong link den email nguoi dung https://twitter.com/forgot-password?token=token
    console.log("forgot_password_token: ", forgot_password_token);
    return {
      message: usersMessage.CHECK_EMAIL_TO_RESET_PASSWORD,
    };
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: "",
          password: hashPassword(password),
        },
        $currentDate: {
          updated_at: true,
        },
      }
    );
    return {
      message: usersMessage.RESET_PASSWORD_SUCCESS,
    };
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      }
    );
    return user;
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
      : payload;
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth: Date }),
        },
        $currentDate: {
          updated_at: true,
        },
      },
      {
        returnDocument: "after",
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      }
    );

    return user.value;
  }
}

const usersService = new UserService();
export default usersService;
