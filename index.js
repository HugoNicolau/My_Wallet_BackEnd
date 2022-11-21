import express from "express";
import {MongoClient, ObjectId} from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import bcrypt from "bcrypt";
import {v4 as tokenGenerator} from 'uuid';

dotenv.config();
const app = express();
app.use(express.json())
app.use(cors());
const mongoClient = new MongoClient(process.env.MONGO_URI);


const userSchema = joi.object({
    name: joi.string().required().min(3),
    email: joi.string().email().required(),
    password: joi.string().required().min(3)

})

const balanceSchema = joi.object({
    description: joi.string().required().min(2).max(30),
    value: joi.number().required()
})


try{
    await mongoClient.connect()
} catch( err){
    console.log(err)
}

const db = mongoClient.db("myWalletDb")


app.post("/sign-up", async (req, res) => {
//nome, email, senha
    try{
        const validation = userSchema.validate(req.body);
        if(validation.error){
            const errors = validation.error.details.map(detail => detail.message);
            res.send(errors).status(422);
            return
        }
        const userExists = await db.collection('users').find({name: req.body.name}).toArray();
        if(userExists.length !== 0){
            console.log("Usuário já existe");
            console.log(userExists);
            res.sendStatus(409);
            return;
        }

        const hashPassword = bcrypt.hashSync(req.body.password, 10);
        await db.collection('users').insertOne({name:req.body.name, email:req.body.email, password:hashPassword});
        res.sendStatus(201)

    }catch(err){
        console.log(err)
        return res.sendStatus(500);
    }
})

app.post("/sign-in", async(req,res) => {
    const { email, password } = req.body;

    try{
        const userExists = await db.collection('users').findOne({email});
        if(!userExists){
            return res.sendStatus(401);
        }
        const passwordOk = bcrypt.compareSync(password, userExists.password);
        


        if(!passwordOk){
            return res.sendStatus(401);
        }
        const token = tokenGenerator();
        await db.collection('sessions').insertOne({token, userId:userExists._id});

        res.send({token})
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
})

app.get("/balance", async(req, res) => {
    const {authorization} = req.headers;
    const token = authorization?.replace("Bearer ", "")

    if(!token){
        return res.sendStatus(401);
    }
    const session = await db.collection('sessions').findOne({token});

    if(!session){
        return res.sendStatus(401);
    }
    const user = await db.collection('users').findOne({_id:session.userId})

    if(!user){
        return res.sendStatus(404);
    }

    const userBalance = await db.collection('balance').find({userId:session.userId});

    return res.send(userBalance);

})

//Vou ter o post balance onde os dados que vou ter são:
//userId, description, value
app.post("/balance", async(req, res) => {
    const {value, description} = req.body
    const {authorization} = req.headers;
    const token = authorization?.replace("Bearer ", "")
    if(!token){
        return res.sendStatus(401);
    }
    const session = await db.collection('sessions').findOne({token});

    if(!session){
        return res.sendStatus(401);
    }
    const user = await db.collection('users').findOne({_id:session.userId})

    if(!user){
        return res.sendStatus(404);
    }



    try{
        const validation = balanceSchema.validate(req.body)
        if(validation.error){
            const errors = validation.error.details.map(detail => detail.message);
            res.send(errors).status(422);
            return
        }

        const item = {userId:session.uderId, value, description}
        await db.collection('balance').insertOne(item)
        res.send(item).status(200)

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }

})



app.listen(5000, () => console.log("Server running at port 5000"));