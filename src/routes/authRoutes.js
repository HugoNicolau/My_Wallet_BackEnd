import { Router } from "express";
import validateSchema from "../middlewares/validateSchema.js";
import userSchema from "../schemas/userSchema.js";
import { signUp, signIn } from "../controllers/authControllers.js";
const route = Router();
route.post("/sign-up", validateSchema(userSchema), signUp);
route.post("/sign-in", signIn);

export default route;
