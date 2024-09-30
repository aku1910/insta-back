import express from "express"

import { sendMessage, getMessages, getConversation } from "../controllers/message.controller.js"

import protectRoute from "../middlewares/protectRoute.js"

const router = express.Router()

router.use(protectRoute)

router.get('/:receiverId', getMessages)

router.post('/:receiverId', sendMessage)

router.get('/conversation/:receiverId', getConversation)

export default router