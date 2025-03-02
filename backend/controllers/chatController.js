const Chat = require('../models/Chat');
const Item = require('../models/Item');
const User = require('../models/User');

const chatController = {
    createChat : async (req ,res) => {
        try {
            const {itemId , receiverId} = req.body;

            const item = await Item.findById(itemId);
            if(!item){
                return res.status(404).json({error:'Item not found'});
            }

            const receiver = await User.findById({receiverId});
            if(!receiver){
                return res.status(404).json({error:'Receiver not found'});
            }

            let chat = await Chat.findOne({
                itemId,
                participants:{$all: [req.user._id , receiverId]} 
            });

            if(!chat){
                chat = new Chat({
                    itemId,
                    participants:[req.user._id , receiverId]
                });
                await chat.save();
            }
            res.status(201).json(chat);
            
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    getChats: async(req ,res) =>{
        try {
            const chats = await Chat.find({
                participants:req.user._id
            })
            .populate('participants', 'name email')
            .populate('itemId', 'title category');
        
            res.json(chats);
            
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    getChatById: async (req ,res) => {
        try {
           const chat = await Chat.findById(req.params.id)
             .populate('participants', 'name email')
             .populate('itemId')
             .populate('messages.sender', 'name email');
           
           if (!chat) {
             return res.status(404).json({ error: 'Chat not found' });
           }
           
           // Check if user is a participant
           if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
             return res.status(403).json({ error: 'Not authorized to view this chat' });
           }
           
           res.json(chat);       
            
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    sendMessage: async (req, res) => {
        try {
          const { text } = req.body;
          const chat = await Chat.findById(req.params.id);
          
          if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
          }
          
          // Check if user is a participant
          if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ error: 'Not authorized to send message in this chat' });
          }
          
          const message = {
            sender: req.user._id,
            text,
            timestamp: new Date()
          };
          
          chat.messages.push(message);
          await chat.save();
          
          // Populate sender info for response
          const populatedChat = await Chat.findById(chat._id)
            .populate('messages.sender', 'name email');
            
          const sentMessage = populatedChat.messages[populatedChat.messages.length - 1];
          
          res.json(sentMessage);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
    },

    getChatMessages: async (req ,res) => {
        try {
           const chat = await Chat.findById(req.params.id)
             .populate('messages.sender', 'name email');
           
           if (!chat) {
             return res.status(404).json({ error: 'Chat not found' });
           }
           
           // Check if user is a participant
           if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
             return res.status(403).json({ error: 'Not authorized to view messages in this chat' });
           }
           
           res.json(chat.messages);       
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

};

module.exports = chatController;