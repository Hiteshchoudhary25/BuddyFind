const express = require('express');
const router = express.Router();

const itemController = require('../controllers/itemController');
const auth = require('../middleware/auth');
const {upload} = require('../middleware/upload');

router.post('/', auth, upload.array('images', 5), itemController.createItem);
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.put('/:id', auth, upload.array('images', 5), itemController.updateItem);
router.delete('/:id', auth, itemController.deleteItem);
router.post('/:id/claim', auth, itemController.claimItem);
router.post('/:id/mark-sold', auth, itemController.markItemAsSold);

module.exports = router;
