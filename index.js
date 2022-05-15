const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
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
        const tokenInfo = req.headers.authorization;
        console.log(tokenInfo);
        const decoded = verifyToken(tokenInfo);
        const email = req.query.email;
        // console.log(email, decoded.email);
        if (email === decoded.email) {
          query = { supplieremail: email };
          const cursor = await itemCollection.find(query);
          const result = await cursor.toArray();
          res.send(result);
        } else {
          res.send({ message: "Unauthorize access" });
        }
      } else {
        query = {};
        const cursor = itemCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
      }
    });

    // single data load by id
    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await itemCollection.findOne(query);
      res.send(item);
    });

    app.post("/signin", (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
      res.send({ token });
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

    // Increase and Decrease Quantity
    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      const updatedValue = req.body.newQuantity;
      console.log(updatedValue);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateQuantity = {
        $set: { quantity: updatedValue },
      };
      const result = await itemCollection.updateOne(
        filter,
        updateQuantity,
        options
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("El Sol Warehouse");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});

// verify token function
function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      email = "Invalid email";
      // console.log(email);
    }
    if (decoded) {
      email = decoded;
      // console.log(email);
    }
  });
  return email;
}
