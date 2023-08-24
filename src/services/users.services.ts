import databaseService from "~/database/database";
import User from "~/models/User.schemas";

class UserService {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload;
    const result = await databaseService.users.insertOne(
      new User({
        email,
        password,
      })
    );
    return result;
  }
}

const usersService = new UserService();
export default usersService;
