const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.port || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());

// Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mongo-first.eblwj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const itemCollection = client.db("elsolWarehouse").collection("items");
    // Data get from server
    app.get("/items", async (req, res) => {
      let query;
      if (req.query.email) {
        const email = req.query.email;
        query = { supplieremail: email };
      } else {
        query = {};
      }
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });
    // single data load by id
    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await itemCollection.findOne(query);
      res.send(item);
    });

    // Data add in server
    app.post("/items", async (req, res) => {
      const newItem = req.body;
      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });

    // Data Delete from server
    app.delete("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Listening to port", port);
});
