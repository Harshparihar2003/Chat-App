const express = require("express");
const mongoose = require("mongoose")
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs")
const ws = require("ws");
const User = require("./models/User")
const Message = require("./models/Message");
const PORT = 4000;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    credentials : true,
    origin : true
}));

dotenv.config()
mongoose.connect(process.env.MONGO_URL)
const jwt_secret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);


app.get('/messages/:userId', async (req,res) => {
    const {userId} = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const messages = await Message.find({
      sender:{$in:[userId,ourUserId]},
      recipient:{$in:[userId,ourUserId]},
    }).sort({createdAt: 1});
    res.json(messages);
  });
  
  app.get('/people', async (req,res) => {
    const users = await User.find({}, {'_id':1,username:1});
    res.json(users);
  });
  
app.get("/profile",(req,res)=>{
    const token = req.cookies?.token;

    if(token){
        jwt.verify(token, jwt_secret, {}, (err,userData)=>{
            if(err) throw err;
            res.json(userData)
        })
    }else{
        res.status(401).json("No token attached");
    }
   
}) 

app.post("/login", async (req,res)=>{
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});
    if(foundUser){
        const passOk = bcrypt.compareSync(password,foundUser.password);
        if(passOk){
            jwt.sign({userId : foundUser._id,username}, jwt_secret, {}, (error, token)=>{
                if(error){
                    throw new Error(error)
                }
                res.cookie("token",token).status(201).json({
                    id : foundUser._id
                });      
            })
        }
    }
})

app.post("/register", async (req,res)=>{
    const {username,password} = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const newUser = await User.create({
            username,
            password : hashedPassword 
        });
    jwt.sign({userId : newUser._id,username}, jwt_secret, {}, (error, token)=>{
        if(error){
            throw new Error(error)
        }
        res.cookie("token",token).status(201).json({
            id : newUser._id,
        });      
    })
    } catch (error) {
        throw Error(error);
    }
    
})

const server = app.listen(PORT,()=>{
    console.log(`App Listening on ${PORT}`);
})

const wss = new ws.WebSocketServer({server})
wss.on("connection",(connection,req)=>{
    // console.log("Web socket connected");
    // connection.send("Heelo there")
    // Read username and id from the cookie for this connection 
    const cookies = req.headers.cookie;
    if(cookies){
        const tokenCookie = cookies.split(",").find(str => str.startsWith("token="));
        if(tokenCookie){
            const token = tokenCookie.split("=")[1];
            if(token){
                jwt.verify(token, jwt_secret, {}, (err,userData)=>{
                    if(err) throw err;
                    const {userId, username} = userData;
                    connection.userId = userId;
                    connection.username = username;
                })
            }
        }
    }

    connection.on("message", async (message)=>{
        const messageData = JSON.parse(message.toString());
        const {recipient,text} = messageData;
        if(recipient && text){
            const messageDoc = await Message.create({
                sender : connection.userId,
                recipient,
                text
            });
            [...wss.clients]
            .filter(c => c.userId === recipient)
            .forEach(c => c.send(JSON.stringify({
                 text,
                 sender : connection.userId,
                 id : messageDoc._id,
                 recipient
                })));
        }
    });

    // notify about online people(when someone connects)
    [...wss.clients].forEach(client=>{
        client.send(JSON.stringify({
            online : [...wss.clients].map((c) => ({userId : c.userId, username : c.username}))
        }))
    })
})