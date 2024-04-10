import express from "express";
import { createGameRoom, getGameRoom, getAllGameRooms } from "../Controllers/gameRoomController.js";

const router = express.Router();

router.post("/create", createGameRoom);
router.get("/find/:socketRoomId", getGameRoom);
router.get("/getAll", getAllGameRooms);

export default router;
