const express = require("express");
const mongoose = require("mongoose")
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs")
const User = require("./models/User")
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

app.listen(PORT,()=>{
    console.log(`App Listening on ${PORT}`);
})