const express = require('express');

const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jrdl1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

async function run() {
    try {
        await client.connect();
        console.log('database connected')
        const database = client.db("best-bike");
        const serviceCollection = database.collection('services');
        const reviewCollection = database.collection('review');
        const userCollection = database.collection('users');
        const orderCollection = database.collection('order');

        // GET services/bike from API to website
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // add service & save service in database
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit api', service);
            const result = await serviceCollection.insertOne(service);
            console.log(result);
            // res.json(result);
            res.json({ message: 'hello' })

        });

        //get single service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('specific service', id);
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        // post customer review
        app.post('/review', async (req, res) => {
            const review = req.body;
            console.log('hit api', review);
            const result = await reviewCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });

        // GET customer review in home page
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });
        //user data
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log('hit api', review);
            const result = await userCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });

        //update user
        app.put('/users', async (req, res) => {
            const user = req.body;
            // console.log('put', user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // make admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            // console.log(result);
            res.json(result);
        });

        // private admin route
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        app.post('/order', async (req, res) => {
            const orders = req.body;
            console.log('hit api', orders);
            const result = await orderCollection.insertOne(orders);
            console.log(result);
            // res.json(result);
            res.json({ message: 'hello' })

        });

        // GET customer ordered product
        app.get('/order', async (req, res) => {
            const cursor = orderCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('best bike server running')
});

app.listen(port, () => {
    console.log('server running:', port);
})

/*

//get single package
app.get('/packages/:id', async (req, res) => {
   const id = req.params.id;
   console.log('specific service', id);
   const query = { _id: ObjectId(id) };
   const package = await packageCollection.findOne(query);
   res.send(package);

})


//POST API
app.post('/packages', async (req, res) => {
   const package = req.body;
   console.log('hit ai', package);

   const result = await packageCollection.insertOne(package);
   console.log(result);
   res.send(result);
}); */