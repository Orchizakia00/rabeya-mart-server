const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sdbndcb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const userCollection = client.db('rabeyaMart').collection('users');
    const productsCollection = client.db('rabeyaMart').collection('products');
    const cartCollection = client.db('rabeyaMart').collection('cart');
    
    cartCollection.createIndex({ _id: 1, userEmail: 1 }, { unique: true })

    // for user registration
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exist', insertedId: null })
      };

      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    // for all products
    app.get('/products', async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    })

    // for cart items
    app.get('/cart', async (req, res) => {
      let query = {};
      if (req.query?.userEmail) {
        query = { userEmail: req.query.userEmail }
      }
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/cart/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.findOne(query);
      res.send(result);
    })

    app.post('/cart', async (req, res) => {
      const data = req.body;
      const result = await cartCollection.insertOne(data);
      res.send(result);
    })

    // app.put('/cart/:id', async (req, res) => {
    //   const { id } = req.params;
    //   const query = { _id: new ObjectId(id) };
    //   const updateDoc = { $set: { quantity: quantity + 1 } };
    //   const result = await cartCollection.updateOne(query, updateDoc);
    //   res.send(result);
    // });

    app.put('/cart/:id', async (req, res) => {
      const { id } = req.params;
      const { quantity } = req.body; // Extract the new quantity from the request body

      try {
        const query = { _id: new ObjectId(id) };
        const updateDoc = { $set: { quantity: quantity } }; // Set the new quantity value
        const result = await cartCollection.updateOne(query, updateDoc);

        if (result.modifiedCount > 0) {
          res.send({ success: true, message: "Cart updated successfully", result });
        } else {
          res.status(404).send({ success: false, message: "Cart item not found or already up to date" });
        }
      } catch (error) {
        res.status(500).send({ success: false, message: "Failed to update cart", error });
      }
    });

    app.delete('/cart/:id', async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })



    // for users
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exist', insertedId: null })
      };

      const result = await userCollection.insertOne(user);
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


app.get('/', (req, res) => {
  res.send('server is running');
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
})