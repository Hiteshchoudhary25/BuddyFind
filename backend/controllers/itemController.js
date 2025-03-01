const Item = require();
const {cloudinary} = require();

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
                endDate.setData(endDate.getDate() + 1);
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
}