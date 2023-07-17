const express = require('express');
const app = express();
const routes = require('./routes/routes')
require('./db/connection')
const connectDB = require('./db/connection');
require('dotenv').config();
// const KEY = require('./auth/jwt')
// require('./auth/crypto')

//middleware
app.use(express.json());


//routes
app.use(routes);



const port = process.env.PORT || 4000;

const start = async() => {
    try {
        await connectDB();
        // await jwtSecret();
        // await KEY();
        app.listen(port, () =>
        console.log(`Server is listening on Port ${port} .... May God help us.`))
    } catch (error) {
        console.log(error);
        
    }
}

start();


