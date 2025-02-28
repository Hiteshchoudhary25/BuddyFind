const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');


const app = express();

//connect to MongoDB
connectDB();

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
