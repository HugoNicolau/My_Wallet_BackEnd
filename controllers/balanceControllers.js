import { db, objectId } from "../dbConnection/mongo.js";

//Vou ter o post balance onde os dados que vou ter são:
//userId, description, value
export async function postBalance(req, res) {
  const { value, description } = req.body;
  const token = res.locals.token;

  const session = await db.collection("sessions").findOne({ token });

  if (!session) {
    return res.sendStatus(401);
  }
  const user = await db
    .collection("users")
    .findOne({ _id: objectId(session.userId) });

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
}
export async function getBalance(req, res) {
  const token = res.locals.token;
  const session = await db.collection("sessions").findOne({ token });
  if (!session) {
    return res.sendStatus(401);
  }
  const user = await db
    .collection("users")
    .findOne({ _id: objectId(session.userId) });

  if (!user) {
    return res.sendStatus(404);
  }

  const userBalance = await db
    .collection("balance")
    .find({ userId: objectId(session.userId) })
    .toArray();

  return res.status(200).send(userBalance);
}
