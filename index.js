const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express")
const cors = require('cors');
const jwt = require("jsonwebtoken")
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
        const favouriteCollection = client.db('BMarryDB').collection('favouriteCollection');

        // Database Collections ------------------>>>>>




        // <<<<<---------------------Custom Middlewars--------------------->>>>>

        const verifyToken = (req, res, next) => {
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'Unauthorized Access' });
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'Unauthorized Access' });
                }
                req.decodedUser = decoded;
                next();
            })
        }

        const verifyAdmin = async (req, res, next) => {
            const email = req.decodedUser.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const isAdmin = user?.role === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ message: 'Forbidden Access' });
            }
            next();
        }

        // <<<<<---------------------Custom Middlewars--------------------->>>>>



        // ====================================== A D M I N ====================================

        // make admin API ^ -------------------------------------------------------->>>>>
        app.patch('/user/admin/:sid', verifyToken, verifyAdmin, async (req, res) => {
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
        app.patch('/user/premium/:sid', verifyToken, verifyAdmin, async (req, res) => {
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

        // get all users api ^ ----------------------------------------------------->>>>>
        app.get('/users/:email', verifyToken, verifyAdmin, async (req, res) => {
            const userEmail = req.params.email;
            if (userEmail !== req.decodedUser.email) {
                return res.status(403).send({ message: 'Forbidden Access' });
            }
            const result = await usersCollection.find({}).toArray()
            res.send(result)
        })

        // ====================================== A D M I N ====================================









        // ====================================== J W T ====================================

        app.post('/jwt', async (req, res) => {
            const data = req.body;
            const token = jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: '1hr' });
            res.send({ token })
        })

        // ====================================== J W T ====================================














        // check admin status API *
        app.get('/user/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            if (email !== req.decodedUser.email) {
                return res.status(403).send({ message: 'Forbidden Access' })
            }
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin })
        })

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

        // create and update biodata API * ---------------------------------------->>>>>
        app.put('/biodata/:email', verifyToken, async (req, res) => {
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
        app.get('/biodata/:email', verifyToken, async (req, res) => {
            const userEmail = req.params.email;
            const query = { email: userEmail };
            const result = await biodataCollection.findOne(query)
            res.send(result);
        })

        // get all biodata API ------------------------------------------------>>>>>>
        app.get('/biodatas', async (req, res) => {
            const result = await biodataCollection.find({}).toArray();
            res.send(result);
        })

        // get on bioData details API ------------------------------------------>>>>>>
        app.get('/oneBio/:sid', async (req, res) => {
            const id = req.params.sid;
            query = { _id: new ObjectId(id) };
            const result = await biodataCollection.findOne(query);
            res.send(result)
        })

        // get self status API *------------------------------------------------->>>>>>
        app.get('/selfStatus', verifyToken, async (req, res) => {
            const query = req.query;
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

        // similar datas API --------------------------------------------------->>>>>>
        app.get('/similar', async (req, res) => {
            const query = req.query;
            const result = await biodataCollection.find(query).toArray();
            res.send(result);
        })

        // add to favourite list API --------------------------------------------->>>>>>
        app.put('/favourite/:email', async (req, res) => {
            const userEmail = req.params.email;
            let comingData = req.body.bioId;
            comingData = new ObjectId(comingData)
            const query = { email: userEmail };
            const haveThisData = await favouriteCollection.findOne(query);
            if (!haveThisData) {
                // if have
                const documentThatInsert = {
                    email: userEmail,
                    fav: [comingData]
                }
                const result = await favouriteCollection.insertOne(documentThatInsert);
                res.send(result);
            } else {
                // not have
                const updatedDoc = {
                    $set: {
                        fav: [comingData, ...haveThisData.fav]
                    }
                }
                const result = await favouriteCollection.updateOne(query, updatedDoc);
                res.send(result);
            }
        })

        // get favourite data API --------------------------------------------->>>>>>
        app.get('/favourite/:email', async (req, res) => {
            const userEmail = req.params.email;
            const query = { email: userEmail }
            const result = await favouriteCollection.findOne(query);
            res.send(result);
        })

        // delete data from the favourite collection API ---------------------->>>>>>
        app.patch('/favourite', async (req, res) => {
            const userEmail = req.query.email;
            const comingId = req.body.sid;
            const query = { email: userEmail };
            const existData = await favouriteCollection.findOne(query);
            const arr = existData.fav.filter(one => !(one.equals(new ObjectId(comingId))));
            console.log(new ObjectId(comingId));
            console.log(arr);
            const updatedDoc = {
                $pull: { fav: new ObjectId(comingId) }
            }
            const result = await favouriteCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        // get users fav only biodatas ---------------------------------------->>>>>>
        app.get('/myFavs/:email', async (req, res) => {
            const userEmail = req.params.email;
            const query = { email: userEmail };
            const findedDoc = await favouriteCollection.findOne(query);
            if (findedDoc) {
                const favIds = findedDoc.fav;
                const matchingDocs = await biodataCollection.find({ _id: { $in: favIds } }).toArray();
                res.send(matchingDocs);
            }
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