import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import balanceRoutes from "./routes/balanceRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use(authRoutes);
app.use(balanceRoutes);

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running at port ${port} :)`));
