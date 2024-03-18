const express = require("express");
const mongoose = require("mongoose")
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User")
const PORT = 4000;
const app = express();
app.use(express.json());

app.use(cors({
    credentials : true,
    origin : true
}));

dotenv.config()
mongoose.connect(process.env.MONGO_URL)
const jwt_secret = process.env.JWT_SECRET;


app.post("/register", async (req,res)=>{
    const {username,password} = req.body;
    try {
        const newUser = await User.create({username,password});
    jwt.sign({userId : newUser._id}, jwt_secret, {}, (error, token)=>{
        if(error){
            throw new Error(error)
        }
        res.cookie("token",token).status(201).json({
            _id : newUser._id
        });      
    })
    } catch (error) {
        throw Error(error);
    }
    
})

app.listen(PORT,()=>{
    console.log(`App Listening on ${PORT}`);
})