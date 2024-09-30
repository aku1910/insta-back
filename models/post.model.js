import mongoose from "mongoose"
const { ObjectId } = mongoose.Schema.Types

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            comment: {
                type: String,
                required: true,
                trim: true,
            },
            username: {
                type: String,
            },
            profilePic: {
                type: String,
            }
        }
    ],
    saved: [{
        savedBy: { type: ObjectId, ref: 'User' },
        postId: { type: ObjectId, ref: 'Post' }
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

}, { timestamps: true })

export default mongoose.model("post", postSchema)