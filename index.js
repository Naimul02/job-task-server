const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();




// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.avssyq6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const usersCollection = client.db('job-task').collection('users')
    const productsCollection = client.db('job-task').collection('products')


    // users
    app.post('/users' , async(req , res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    // products
    app.get('/products' , async(req , res) => {
      const result = await productsCollection.find().toArray();
      res.send(result)
    })


    // pagination
    // products count
    app.get('/productsCount' , async(req , res) => {
      const count = await productsCollection.estimatedDocumentCount();
      // console.log(count)
      res.send({count})
    })
    app.get('/productsPerPage' , async(req , res) => {
      const currentPage = parseInt(req.query.page);
      const itemsPerPage = parseInt(req.query.size);


      const result = await productsCollection.find().skip(currentPage * itemsPerPage).limit(itemsPerPage).toArray();
      res.send(result);
})

// category
app.get("/categoryBrand" , async(req , res) => {

const brand = req.query.brand;
const query = {brand : brand};
const result = await productsCollection.find(query).toArray();
res.send(result)
})
app.get("/category" , async(req , res) => {

const category = req.query.category;
const query = {category : category};
const result = await productsCollection.find(query).toArray();
res.send(result)
})

app.get("/price" , async(req , res) => {
  const minPrice = parseInt(req.query.minPrice);
  const maxPrice = parseInt(req.query.maxPrice);
  // console.log(minPrice , maxPrice);

  const result = await productsCollection.find({
    price : {$gte : minPrice , $lte : maxPrice}
  }).toArray();
  res.send(result);

})












  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/' , (req , res) => {
    res.send("The server is running")
})
app.listen(port  , () => {
        console.log(`The server is running port on ${port}`)
})