import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import { v4 as tokenGenerator } from "uuid";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  await mongoClient.connect();
} catch (err) {
  console.log(err);
}

const db = mongoClient.db("myWalletDb");

app.post("/sign-up", async (req, res) => {
  //nome, email, senha
  try {
    const userExists = await db
      .collection("users")
      .find({ name: req.body.name })
      .toArray();
    if (userExists.length !== 0) {
      console.log("Usuário já existe");
      console.log(userExists);
      res.sendStatus(409);
      return;
    }

    const hashPassword = bcrypt.hashSync(req.body.password, 10);
    await db.collection("users").insertOne({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
    });
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await db.collection("users").findOne({ email });
    if (!userExists) {
      return res.sendStatus(401);
    }
    const passwordOk = bcrypt.compareSync(password, userExists.password);

    if (!passwordOk) {
      return res.sendStatus(401);
    }
    const token = tokenGenerator();
    await db
      .collection("sessions")
      .insertOne({ token, userId: userExists._id });

    res.send({ token });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.get("/balance", async (req, res) => {
  const token = res.locals.token;
  const session = await db.collection("sessions").findOne({ token });
  if (!session) {
    return res.sendStatus(401);
  }
  const user = await db
    .collection("users")
    .findOne({ _id: ObjectId(session.userId) });

  if (!user) {
    return res.sendStatus(404);
  }

  const userBalance = await db
    .collection("balance")
    .find({ userId: ObjectId(session.userId) })
    .toArray();

  return res.status(200).send(userBalance);
});

//Vou ter o post balance onde os dados que vou ter são:
//userId, description, value
app.post("/balance", async (req, res) => {
  const { value, description } = req.body;
  const token = res.locals.token;

  const session = await db.collection("sessions").findOne({ token });

  if (!session) {
    return res.sendStatus(401);
  }
  const user = await db
    .collection("users")
    .findOne({ _id: ObjectId(session.userId) });

  console.log(user);
  if (!user) {
    return res.sendStatus(404);
  }

  try {
    const item = { userId: session.userId, value, description };
    await db.collection("balance").insertOne(item);
    res.send(item).status(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(5000, () => console.log("Server running at port 5000 :)"));
