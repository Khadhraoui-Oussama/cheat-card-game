import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import mongoose from "mongoose";

import playerRouter from "./Routes/playerRoute.js";
import gameStateRouter from "./Routes/gameStateRoute.js";
import gameRoomRouter from "./Routes/gameRoomRoute.js";
import gameConfigurationRouter from "./Routes/gameConfigurationRoute.js";

//configure env variables
dotenv.config();

const app = express();
const server = createServer(app);

app.use(express.json());
// const allowedOrigins = ["https://superb-kulfi-fa8c06.netlify.app/", "*"];

// const corsOptions = {
// 	origin: function (origin, callback) {
// 		if (allowedOrigins.includes(origin)) {
// 			callback(null, true);
// 		} else {
// 			callback(new Error("Not allowed by CORS"));
// 		}
// 	},
// };

// app.use(cors(corsOptions));

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.get("/", (req, res) => {
	res.send("You have reached the card game API...");
});

server.listen(port, (req, res) => {
	console.log(`Server running on port ${port}`);
});

app.use("/api/players", playerRouter);
app.use("/api/gameState", gameStateRouter);
app.use("/api/gameRoom", gameRoomRouter);
app.use("/api/gameConfig", gameConfigurationRouter);

mongoose
	.connect(uri)
	.then(() => console.log("MongoDB connection established !"))
	.catch((error) => console.log("MongoDB connection failed ,", error.message));
