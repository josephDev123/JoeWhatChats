import express, { Express, Request, Response, NextFunction } from "express";
import { dbConnection } from "./db";
import cors from "cors";
import dotenv from "dotenv";
import { AuthRoute } from "./routes/auths/authRoute";
import cookieParser from "cookie-parser";
import { authenticateToken } from "./middleware/authenticateToken";
import { Server } from "socket.io";
import { createServer } from "http";
import { User } from "./utils/User";
import { chatMsgModel } from "./models/chatMsg";
import { chatMsgRoute } from "./routes/chat/chatMsg";
import { errorHandleMiddleware } from "./middleware/errorHandlerMiddleware";
import { roomModel } from "./models/rooms";
import { chatRoomRoute } from "./routes/Chatroom/chatRoom";
import { PollModel } from "./models/Polling";
import { VoteRouter } from "./routes/votePoll";

dotenv.config();

const corsOption = {
  origin: "http://localhost:5173",
  credentials: true,
};

const app: Express = express();
const HttpServer = createServer(app);
const io = new Server(HttpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());

const startApp = async () => {
  try {
    const user = new User();
    await dbConnection();

    // socketServer.io
    io.on("connection", (socket) => {
      socket.on("createRoom", async (roomOption) => {
        socket.join(roomOption.roomUniqueName);
        io.to(roomOption.roomUniqueName).emit("getCreateRoom", roomOption);

        const roomModelDb = new roomModel(roomOption);
        await roomModelDb.save();
      });

      socket.on("JoinInviteRoom", async (data) => {
        try {
          // await roomModel.updateOne(
          //   { roomUniqueName: data.roomUniqueName },
          //   { $addToSet: { join: data } }
          // );

          socket.join(data.roomUniqueName);
          const existingRooms = await roomModel.find({
            roomUniqueName: data.roomUniqueName,
          });

          existingRooms.forEach(async (existingRoom) => {
            const userEmailExists = existingRoom.join.some(
              (joinData: any) => joinData.userEmail === data.userEmail
            );

            if (!userEmailExists) {
              await roomModel.updateOne(
                { roomUniqueName: data.roomUniqueName },
                { $addToSet: { join: data } }
              );
            } else {
              console.log(
                "User email already exists in the join array for room:",
                existingRoom.roomUniqueName
              );
            }
          });
        } catch (error) {
          console.log(error);
        }
      });

      socket.on("welcomeMessage", (room) => {
        socket.join(room.room);
        user.addUser(socket.id, room.room);
        // console.log(room.room);
        const userRoom = user.getUser(room.room);

        if (userRoom) {
          io.to(userRoom.room).emit(
            "welcomeMessage",
            `welcome to ${room.room} room`
          );
        } else {
          console.log("User not found or missing room information.");
        }
      });

      socket.on("submitMessage", async (data) => {
        socket.join(data.room);
        // console.log(userRoom);
        const submittedChatData = {
          name: data.name,
          room: data.room,
          chat: data.chat,
          time: data.time,
        };

        io.to(data.room).emit("exchangeMessage", submittedChatData);
        const chatMsg = new chatMsgModel(submittedChatData);
        await chatMsg.save();
      });

      socket.on("createPoll", async (data) => {
        try {
          socket.join(data.room);
          const pollObjDb = {
            question: data.question,
            options: [{ option: data.optionOne }, { option: data.optionTwo }],
            multiple_answer: data.multipleAnswer,
          };

          const pollResp = new PollModel({
            ...pollObjDb,
          });
          await pollResp.save();
          const chatMessageModel = new chatMsgModel({
            name: data.user.data.name,
            room: data.room,
            type: data.type,
            // chat: { type: String },
            // time: { type: String },
            poll_id: pollResp._id,
          });

          await chatMessageModel.save();

          const pollObj = {
            name: data.user.data.name,
            room: data.room,
            type: data.type,
            poll_id: {
              _id: pollResp._id,
              question: data.question,
              options: [
                { option: data.optionOne, count: 0 },
                { option: data.optionTwo, count: 0 },
              ],
              multiple_answer: data.multipleAnswer,
              peopleWhovoted: [],
            },
          };
          console.log(pollObj);
          io.to(data.room).emit("listenToCreatePoll", pollObj);
        } catch (error) {
          console.log(error);
        }
      });

      socket.on("onVoted", async (data) => {
        try {
          // real-time update
          const newChat = data.chats.map((chat: any) => {
            if (chat.poll_id && chat.poll_id.options) {
              chat.poll_id.options = chat.poll_id.options.map((option: any) => {
                if (option._id === data.whatToUpdateId) {
                  // Increment count by 1
                  option.count = (option.count || 0) + 1;
                  // Add user to peopleWhovoted array if not already present
                  if (!chat.poll_id.peopleWhovoted.includes(data.user)) {
                    chat.poll_id.peopleWhovoted.push(data.user);
                  }
                }
                return option;
              });
            }
            return chat;
          });

          socket.emit("listToOnVoted", newChat);
          // update the db
          await PollModel.updateOne(
            { _id: data.item._id, "options.option": data.optionToUpdate },
            {
              $inc: { "options.$.count": 1 },
              $push: { peopleWhovoted: data.user },
            }
          );
        } catch (error) {
          console.log(error);
        }
      });
    });

    // routes
    app.use("/auth", AuthRoute);
    app.use("/room", chatRoomRoute);
    app.use("/chat", chatMsgRoute);
    app.use("/vote", VoteRouter);
    app.use(errorHandleMiddleware);
    HttpServer.listen(process.env.PORT, () => {
      console.log(`listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startApp();
