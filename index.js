const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dlgpe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usercollection = client.db("naturaDb").collection("users");
    const reviewscollection = client.db("naturaDb").collection("reviews");
    const newslettercollection = client.db("naturaDb").collection("newsletter");
    const trainerscollection = client.db("naturaDb").collection("trainers");
    const classesscollection = client.db("naturaDb").collection("classess");

    //user related api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usercollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usercollection.find().toArray();
      res.send(result);
    });

    //trainer reated api
    app.get("/trainers", async (req, res) => {
      const result = await trainerscollection.find().toArray();
      res.send(result);
    });

    app.get("/trainers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await trainerscollection.findOne(query);
      res.send(result);
    });

    //classess related api
    app.get("/allclassess", async (req, res) => {
      let query = {};
      const search = req.query?.search;
      console.log(req.query);
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }
      const result = await classesscollection.find(query).toArray();
      res.send(result);
    });

    //reviews related api
    app.get("/reviews", async (req, res) => {
      const result = await reviewscollection.find().toArray();
      res.send(result);
    });

    //newsletter related api
    app.post("/newsletter", async (req, res) => {
      const newsletter = req.body;
      const query = { email: newsletter.email };
      const existingEmail = await newslettercollection.findOne(query);
      if (existingEmail) {
        return res.send({
          message: "Already subscribed",
          insertedId: null,
        });
      }
      const result = await newslettercollection.insertOne(newsletter);
      res.send(result);
    });
    app.get("/newsletter", async (req, res) => {
      const result = await newslettercollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log("server running on port", port);
});
