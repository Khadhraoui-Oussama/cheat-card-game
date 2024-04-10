import express from "express";

import {
	createGameConfig,
	getGameConfig,
	getAllGameConfigs,
} from "../Controllers/gameConfigController.js";

const router = express.Router();

router.post("/create", createGameConfig);
router.get("/find/:socketRoomId", getGameConfig);
router.get("/getAll", getAllGameConfigs);

export default router;
