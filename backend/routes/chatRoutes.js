const express = require('express');
const router = express.Router();


const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/', auth, chatController.createChat);
router.get('/', auth, chatController.getChats);
router.get('/:id', auth, chatController.getChatById);
router.post('/:id/messages', auth, chatController.sendMessage);
router.get('/:id/messages', auth, chatController.getChatMessages);

module.exports = router;