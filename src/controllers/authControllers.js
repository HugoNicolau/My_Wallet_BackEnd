import { db } from "../dbConnection/mongo.js";
import bcrypt from "bcrypt";
import { v4 as tokenGenerator } from "uuid";
export async function signIn(req, res) {
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
}
export async function signUp(req, res) {
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
}
