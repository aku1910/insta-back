import express from "express"
import { createPost, deleteComment, deletePost, getAllPosts, getFollowingPosts, getUserPost, likeUnlikePost, newComment } from "../controllers/posts.controller.js"
import protectRoute from "../middlewares/protectRoute.js"

const router = express.Router()

router.post("/create", protectRoute, createPost)
router.post('/posts/:postId',protectRoute, deletePost);
router.post("/:id", protectRoute, newComment)
router.delete("/:id/:commentId", protectRoute, deleteComment)
router.get("/", protectRoute, getAllPosts)
router.get("/getuserpost/:id", protectRoute, getUserPost)
router.get('/following', protectRoute, getFollowingPosts);
router.get("/:id", protectRoute, likeUnlikePost)


export default router
