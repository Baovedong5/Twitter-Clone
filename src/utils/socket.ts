import { ObjectId } from "mongodb";
import { Server } from "socket.io";
import { Server as ServerHttp } from "http";

import { verifyAccessToken } from "./common";
import { TokenPayload } from "~/models/requests/User.requests";
import { UserVerifyStatus } from "~/constants/enum";
import { ErrorWithStatus } from "~/models/Errors";
import { usersMessage } from "~/constants/messages";
import httpStatus from "~/constants/httpStatus";
import databaseService from "~/database/database";
import Conversation from "~/models/schemas/Conversations.schema";

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const users: {
    [key: string]: {
      socket_id: string;
    };
  } = {};

  io.use(async (socket, next) => {
    const Authorization = socket.handshake.auth.Authorization;
    const access_token = Authorization?.split(" ")[1];
    try {
      const decoded_authorization = await verifyAccessToken(access_token);
      const { verify } = decoded_authorization as TokenPayload;
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: usersMessage.USER_NOT_VERIFIED,
          status: httpStatus.FORBIDDEN,
        });
      }
      //Truyen decoded_authorization vao socket de su dung
      socket.handshake.auth.decoded_authorization = decoded_authorization;
      socket.handshake.auth.access_token = access_token;
      next();
    } catch (error) {
      next({
        message: "Unauthorizes",
        name: "UnauthorizedError",
        data: error,
      });
    }
  });

  io.on("connection", (socket) => {
    // console.log(`user ${socket.id} connected`);
    const { user_id } = socket.handshake.auth
      .decoded_authorization as TokenPayload;
    users[user_id] = { socket_id: socket.id };
    // console.log(users);

    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth;
      try {
        await verifyAccessToken(access_token);
        next();
      } catch (error) {
        next(new Error("Unauthorzired"));
      }
    });

    socket.on("error", (error) => {
      if (error.message === "Unauthorzired") {
        socket.disconnect();
      }
    });

    socket.on("send_message", async (data) => {
      const { receiver_id, sender_id, content } = data.payload;
      const receiver_socket_id = users[receiver_id]?.socket_id;

      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id),
        content: content,
      });

      const result = await databaseService.conversations.insertOne(
        conversation
      );

      conversation._id = result.insertedId;
      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit("receiver_message", {
          payload: conversation,
        });
      }
    });

    socket.on("disconnect", () => {
      delete users[user_id];
      // console.log(`user ${socket.id} disconnected`);
      // console.log(users);
    });
  });
};

export default initSocket;
