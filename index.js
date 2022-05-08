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
    app.get("/items", async (req, res) => {
      const query = {};
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
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running server");
});

app.listen(port, () => {
  console.log("Listenting to port", port);
});
