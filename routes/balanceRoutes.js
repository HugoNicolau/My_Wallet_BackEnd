import { Router } from "express";
import validateSchema from "../middlewares/validateSchema.js";
import balanceSchema from "../schemas/balanceSchema.js";
import validateToken from "../middlewares/validateToken.js";
import { getBalance, postBalance } from "../controllers/balanceControllers.js";
const route = Router();
route.post(
  "/balance",
  validateToken,
  validateSchema(balanceSchema),
  postBalance
);
route.get("/balance", validateToken, getBalance);

export default route;
