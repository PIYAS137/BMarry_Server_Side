const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express")
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5022;

// <<<<<----------------------------------middlewares------------------------------->>>>>
require('dotenv').config();
app.use(express.json());
app.use(cors())
// <<<<<----------------------------------middlewares------------------------------->>>>>

// <<<<<<--------------------------------------MONGO DB-------------------------------------->>>>>>


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.frg7rqf.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // Database Collections ------------------>>>>>

        const usersCollection = client.db('BMarryDB').collection('usersCollection');

        // Database Collections ------------------>>>>>




        // Custom Middlewars--------------------->>>>>
        // Custom Middlewars--------------------->>>>>


        // add user during registration and google login------------------------->>>>>
        app.put('/users', async (req, res) => {
            const data = req.body;
            const query = { email: data.email }
            const isExist = await usersCollection.findOne(query);
            if (isExist) {
                res.send({ status: 1 })
            } else {
                const result = await usersCollection.insertOne(data)
                res.send(result)
            }
        })

        // get all users api----------------------------------------------------->>>>>
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find({}).toArray()
            res.send(result)
        })

        // ====================================== A D M I N ====================================

        // make admin API-------------------------------------------------------->>>>>
        app.patch('/user/admin/:sid', async (req, res) => {
            const id = req.params.sid;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        // make premium API-------------------------------------------------------->>>>>
        app.patch('/user/premium/:sid', async (req, res) => {
            const id = req.params.sid;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    is_premium: true
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        // ====================================== A D M I N ====================================


























        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// --------------------------------------MONGO DB--------------------------------------


app.get('/', async (req, res) => {
    res.send("Server is coming soon....!!!")
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})