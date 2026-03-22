import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

function authMiddleware(req, res, next){
    const authheader = req.headers.authorization;
    if (!authheader){
        return res.status(401).json({msg: "No Token"});
    }
    const token = authheader.split(" ")[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userID = decoded.id;
        next();
    } catch {
        return res.status(401).json({msg: "Invalid Token"});
    }
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB connected"))
    .catch(err=>console.log(err));

app.get("/",(req,res)=>{
    res.send("API Running");
});

app.post("/api/auth/register",async (req,res)=>{
    const {username,password} = req.body;
    if (!username||!password){
        return res.status(400).json({msg: "Missing Fields"});
    }
    const exists = await User.findOne({username});
    if (exists){
        return res.status(400).json({msg: "User Already Exists"});
    }
    const hashed = await bcryptjs.hash(password,10);
    await User.create({
        username,
        password: hashed
    });
    res.json({msg: "Registered"});
});

app.post("/api/auth/login",async (req,res)=>{
    const {username,password} = req.body;
    const user = await User.findOne({username});
    if (!user){
        return res.status(400).json({msg: "Invalid Credentials"});
    }
    const match = await bcryptjs.compare(password,user.password);
    if (!match){
        return res.status(400).json({msg: "Invalid Credentials"});
    }
    const token = jwt.sign(
        {id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    );
    res.json({token});
});

app.post("/api/user/buy", authMiddleware, async(req, res)=>{
    const {qty,price} = req.body;
    if (!qty||qty<=0||!price){
        return res.status(400).json({msg: "Invalid Input"});
    }
    const user = await User.findById(req.userID);
    const cost = qty*price;
    if (user.balance<cost){
        return res.status(400).json({msg: "Insufficient Funds"});
    }
    user.balance-=cost;
    user.holdings.push({qty,buyPrice: price});
    await user.save();
    res.json({msg: "Bought", balance: user.balance});
});

app.post("/api/user/sell", authMiddleware, async(req, res)=>{
    const {index,price} = req.body;
    const user = await User.findById(req.userID);
    const holding = user.holdings[index];
    if (!holding){
        return res.status(400).json({msg: "Invalid Holding"});
    }
    const value = holding.qty*price;
    const pnl = (price-holding.buyPrice)*holding.qty;
    user.balance+=value;
    user.holdings.splice(index,1);
    user.trades.push({
        qty: holding.qty,
        entry: holding.buyPrice,
        exit: price,
        date: new Date().toLocaleDateString(),
        pndl: pnl
    })
    await user.save();
    res.json({msg: "Sold", balance: user.balance});
});

app.post("/api/user/reset", authMiddleware, async(req, res)=>{
    const user = await User.findById(req.userID);
    if (!user){
        return res.status(404).json({msg: "User Not Found"});
    }
    user.balance = 2000;
    user.holdings = [];
    user.trades = [];
    await user.save();
    res.json({msg: "Account Reset", balance: user.balance});
});

app.get("/api/user/me", authMiddleware, async(req, res)=>{
    const user = await User.findById(req.userID).select("-password");
    if (!user){
        return res.status(404).json({msg: "User Not Found"});
    }
    res.json(user);
})

const PORT = process.env.PORT || 5001;
app.listen(PORT,()=>{
    console.log(`Server Running On ${PORT}`);
});