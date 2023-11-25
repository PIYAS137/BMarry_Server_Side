const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express")
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5022;


// * <== means Users secure api
// ^ <== meand Admins secure api



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
        const biodataCollection = client.db('BMarryDB').collection('bioidataCollection');

        // Database Collections ------------------>>>>>




        // Custom Middlewars--------------------->>>>>
        // Custom Middlewars--------------------->>>>>



        // ====================================== A D M I N ====================================

        // make admin API ^ -------------------------------------------------------->>>>>
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

        // make premium API ^ -------------------------------------------------------->>>>>
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

        // create and update biodata API * ---------------------------------------->>>>>
        app.put('/biodata/:email', async (req, res) => {
            const data = req.body;
            const userEmail = req.params.email;
            const query = { email: userEmail };
            const isExist = await biodataCollection.findOne(query);
            if (isExist) {
                // Update data
                const updatedDocAlready = {
                    $set: {
                        name: data.name,
                        age: data.age,
                        biodata_image: data.biodata_image,
                        gender: data.gender,
                        birth: data.birth,
                        height: data.height,
                        weight: data.weight,
                        race: data.race,
                        occupation: data.occupation,
                        father_name: data.father_name,
                        mother_name: data.mother_name,
                        parmanent_address: data.parmanent_address,
                        present_address: data.present_address,
                        expected_age: data.expected_age,
                        expected_height: data.expected_height,
                        expected_weight: data.expected_weight,
                        email: data.email,
                        phone: data.phone,
                    }
                };
                const result = await biodataCollection.updateOne(query, updatedDocAlready);
                res.send(result);
            } else {
                // New data
                const allDatas = await biodataCollection.find({}).toArray();
                const datasLen = allDatas.length;
                const biodataId = datasLen + 1;
                const updatedDoc = {
                    name: data.name,
                    age: data.age,
                    biodata_image: data.biodata_image,
                    gender: data.gender,
                    birth: data.birth,
                    height: data.height,
                    weight: data.weight,
                    race: data.race,
                    occupation: data.occupation,
                    father_name: data.father_name,
                    mother_name: data.mother_name,
                    parmanent_address: data.parmanent_address,
                    present_address: data.present_address,
                    expected_age: data.expected_age,
                    expected_height: data.expected_height,
                    expected_weight: data.expected_weight,
                    email: data.email,
                    phone: data.phone,
                    biodata_id: biodataId
                };
                const result = await biodataCollection.insertOne(updatedDoc);
                res.send(result);
            }
        })

        // get one person full biodata API * ------------------------------------>>>>>>
        app.get('/biodata/:email',async(req,res)=> {
            const userEmail = req.params.email;
            const query = {email : userEmail};
            const result = await biodataCollection.findOne(query)
            res.send(result);
        })


























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