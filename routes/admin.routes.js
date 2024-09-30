import express from "express"

import { adminSignin, adminSignup, deleteUser, getAllUsers } from "../controllers/admin.controller.js"
import { adminProtect } from "../middlewares/adminProtect.js"


const router = express.Router()

router.post("/admin/signup", adminSignup)

router.post("/admin/signin", adminSignin)

router.post('/admin/users/:userId', adminProtect, deleteUser)

router.get('/admin/users', adminProtect, getAllUsers);


export default router
