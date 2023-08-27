import { ObjectId } from "mongodb";
import { TokenType } from "~/constants/enum";
import databaseService from "~/database/database";
import { RegisterReqBody } from "~/models/requests/User.requests";
import RefreshToken from "~/models/schemas/RefreshToken.schemas";
import User from "~/models/schemas/User.schemas";
import { hashPassword } from "~/utils/bcrypt";
import { signToken } from "~/utils/jwt";

class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPRIES,
      },
    });
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPRIES,
      },
    });
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id),
    ]);
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
      })
    );

    const user_id = result.insertedId.toString();
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(
      user_id
    );

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email });
    return Boolean(result);
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(
      user_id
    );
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
}

const usersService = new UserService();
export default usersService;
