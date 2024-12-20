import { Router } from "express";
import { Response } from "express";
import {
  register,
  loginController,
  ConfirmOtp,
  refresh_token,
  MiddlewareTesting,
  users,
} from "../../controllers/AuthController";
import { authenticateToken } from "../../middleware/authenticateToken";

export const AuthRoute = Router();

AuthRoute.post("/register", register);
AuthRoute.get("/users", users);
AuthRoute.post("/login", loginController);
AuthRoute.get("/refresh-access-token", refresh_token);
AuthRoute.post("/middleware-testing", authenticateToken, MiddlewareTesting);
