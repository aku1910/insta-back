import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getSocketId } from "../socket.js";
import {io} from "../socket.js"

export const sendMessage = async (request, response) => {
    try {
        const { message } = request.body;
        const { receiverId } = request.params;
        const senderId = request.user._id;

        // if (!message || !receiverId) {
        //     return response.status(400).send({ error: "Message and receiverId are required" });
        // }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = await Message.create({ senderId, receiverId, message });

        // Hata kontrolü
        if (!newMessage) {
            return response.status(500).send({ error: "Failed to create new message" });
        }

        conversation.messages.push(newMessage._id);

        await conversation.save();

        const socketId = getSocketId(receiverId)
        io.to(socketId).emit('newMessage', newMessage)
        response.status(201).send(newMessage);

    } catch (error) {
        console.error("Error in sendMessage:", error);
        response.status(500).send({ error: "Internal Server Error" });
    }
};

export const getMessages = async (request, response) => {
    try {
        const { receiverId } = request.params;
        const senderId = request.user._id;


        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages");

        if (!conversation) {
            return response.status(200).send([]);
        }

        const messages = conversation.messages;
        response.status(200).send(messages);

    } catch (error) {
        console.error("Error in getMessage:", error);
        response.status(500).send({ error: "Internal Server Error" });
    }
};
export const getConversation = async (request, response) => {
    try {
        const { receiverId } = request.params;
        const senderId = request.user._id;


        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages");

        if (!conversation) {
            return response.status(200).send([]);
        }

        response.status(200).send(conversation);

    } catch (error) {
        console.error("Error in getMessage:", error);
        response.status(500).send({ error: "Internal Server Error" });
    }
};