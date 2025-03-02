const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const chatRoutes = require('./routes/chatRoutes');


const app = express();
const PORT = process.env.PORT || 5000;



//Middleware
app.use(cors());
// app.use(cors({
//     origin: "http://localhost:3000",  // Allow only this origin
//     methods: ["GET", "POST", "PUT", "DELETE"],  // Allowed HTTP methods
//     credentials: true  // Allow cookies/auth headers
// }));
app.use(express.json());

//Routes
app.use('/api/auth',authRoutes);
app.use('/api/items',itemRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//connect to MongoDB
connectDB();