const express = require("express");
const mongoose = require("mongoose")
const PORT = 4000;
const app = express();
const dotenv = require("dotenv");

dotenv.config()
mongoose.connect(process.env.MONGO_URL)
app.get("/test", (req,res)=>{
    res.json("Test ok")
})

app.listen(PORT,()=>{
    console.log(`App Listening on ${PORT}`);
})