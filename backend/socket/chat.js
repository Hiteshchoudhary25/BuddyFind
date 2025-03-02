const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');

const setupSocket = (server) => {
    const io = socketIO(server);

    io.use(async (socket , next) => {
        try {
            const token = socket.handshake.auth.token;
            const decoded = jwt.verify(token , process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();            
        } catch (error) {
            next(new Error('Authinication Error'));
        }
    });

    io.on('connection',(socket) => {
        socket.on('join-chat',(chatId) => {
            socket.join(chatId);
        });

        socket.on('send-message' , async (data) =>{
            try {
                const {chatId , text} = data;
                const chat = await Chat.findById(chatId);

                if(!chat) return;

                const message = {
                    sender : socket.userId,
                    text,
                    timestamp: new Date()
                };
                
                chat.messages.push(message);
                await chat.save();

                const populatedChat = await Chat.findById(chatId).populate('messages.sender' ,'name email');

                const sentMessage = populatedChat.messages[populatedChat.messages.length - 1];
                io.to(chatId).emit('new-message', sentMessage);
            } catch (error) {
                console.error('Message error:', error);
            }
        });
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

module.exports = setupSocket;