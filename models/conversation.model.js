import mongoose from "mongoose";

const conversationSchema = mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    ],

    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]


})

export default mongoose.model('Conversation', conversationSchema)