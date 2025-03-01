const Item = require('../models/Item');
const {cloudinary} = require('../middleware/upload');

const itemController = {
    createItem: async (req ,res) => {
        try {
         const {title , description , category , university , price} = req.body;
         const images = req.files ? req.files.map(file => file.path) :[];

         const item = new Item({
            title,
            description,
            category,
            images,
            listedBy:req.user._id,
            university,
            price:category === 'sell' ? price : undefined
         });

         if(category === 'found'){
            item.autoSellDate = new Date(Date.now() + 75 * 24 * 60 * 60 * 1000); //75 days
            item.autoSellEligible = true;
         }

         await item.save();
         res.status(201).json(item);
            
        } catch (error) {
            res.status(400).json({error : error.message});
        }
    },

    getItems: async (req ,res) => {
        try {
            const {category , university , date , status} = req.query;
            const query = {};

            if(category) query.category = category;
            if(university) query.university = university;
            if(status) query.status = status;
            if(date){
                const startDate = new Date(date);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);
                query.dateListed = { $gte: startDate, $lt: endDate };
            }
            const items = await Item.find(query)
                    .populate('listedBy', 'name email')
                    .sort('-createdAt');
              
            res.json(items);
            
        } catch (error) {
            res.status(400).json({error : error.message});
        }
    },

    getItemById: async (req, res) => {
        try {
          const item = await Item.findById(req.params.id)
            .populate('listedBy', 'name email');
          
          if (!item) {
            return res.status(404).json({ error: 'Item not found' });
          }
          
          res.json(item);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      },
      
      updateItem: async (req, res) => {
        try {
          const { title, description, category, university, price, status } = req.body;
          const item = await Item.findById(req.params.id);
          
          if (!item) {
            return res.status(404).json({ error: 'Item not found' });
          }
          
          // Check if the user is the owner of the item
          if (item.listedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this item' });
          }
          
          // Update fields
          if (title) item.title = title;
          if (description) item.description = description;
          if (category) item.category = category;
          if (university) item.university = university;
          if (price && (category === 'sell' || item.category === 'sell')) item.price = price;
          if (status) item.status = status;
          
          // Add new images if any
          if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            item.images = [...item.images, ...newImages];
          }
          
          await item.save();
          res.json(item);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      },
      
      deleteItem: async (req, res) => {
        try {
          const item = await Item.findById(req.params.id);
          
          if (!item) {
            return res.status(404).json({ error: 'Item not found' });
          }
          
          // Check if the user is the owner of the item
          if (item.listedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this item' });
          }
          
          // Delete images from cloudinary
          for (const image of item.images) {
            const publicId = image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`buddyfind/${publicId}`);
          }
          
          await Item.findByIdAndDelete(req.params.id);
          
          res.json({ message: 'Item deleted successfully' });
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      },
      
      claimItem: async (req, res) => {
        try {
          const item = await Item.findById(req.params.id);
          
          if (!item) {
            return res.status(404).json({ error: 'Item not found' });
          }
          
          if (item.status !== 'unclaimed') {
            return res.status(400).json({ error: 'Item is already claimed or sold' });
          }
          
          item.status = 'claimed';
          await item.save();
          
          res.json({ message: 'Item claimed successfully', item });
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      },
      
      markItemAsSold: async (req, res) => {
        try {
          const item = await Item.findById(req.params.id);
          
          if (!item) {
            return res.status(404).json({ error: 'Item not found' });
          }
          
          // Check if the user is the owner of the item
          if (item.listedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this item' });
          }
          
          if (item.category !== 'sell') {
            return res.status(400).json({ error: 'Only sell items can be marked as sold' });
          }
          
          item.status = 'sold';
          await item.save();
          
          res.json({ message: 'Item marked as sold', item });
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
    }
};

module.exports = itemController;