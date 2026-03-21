import mongoose from "mongoose";

const holdingschema = new mongoose.Schema({
        qty: Number,
        buyPrice: Number
});

const tradeschema = new mongoose.Schema({
        qty: Number,
        entry: Number,
        exit: Number,
        date: String,
        pndl: Number
});

const userSchema = new mongoose.Schema({
        username: {type: String, unique: true, required: true},
        password: {type: String, required: true},
        balance: {type: Number, default: 2000},
        holdings: [holdingschema],
        trades: [tradeschema],
});

export default mongoose.model("User", userSchema);