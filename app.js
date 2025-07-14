const express = require('express');
const app = express();
const routes = require('./routes/routes')
require('./db/connection')
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const app = express();
const routes = require('./routes/routes');
const sql = require('./db/connection');

//middleware
app.use(express.json());


//routes
app.use(routes);



const port = process.env.PORT || 4000;

const start = async () => {
    try {
        // Test the database connection
        const result = await sql`SELECT version()`;
        console.log('Database connected successfully:', result[0].version);

        app.listen(port, () =>
            console.log(`Server is listening on Port ${port} .... May God help us.`)
        );
    } catch (error) {
        console.error('Failed to connect to the database.');
        console.error(error);
        process.exit(1); // Exit if the database connection fails
    }
};

start();


