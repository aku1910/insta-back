import express from "express";

import getAllUsers from "../controllers/users.controller.js"

import protectRoute from "../middlewares/protectRoute.js"

const router = express.Router()


router.get("/" , protectRoute , getAllUsers)

export default router