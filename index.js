const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(
    cors({
      origin: [
        "http://localhost:5173",
        
      ],
      credentials: true,
    })
  );


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9ekrxrn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// console.log(uri);

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

    const foodsCollection = client.db("tadooriFreshDB").collection("allFoods");

    const galleryCollection = client
      .db("tadooriFreshDB")
      .collection("allGallery");
    
    const purchaseFoodsCollection = client
      .db("tadooriFreshDB")
      .collection("purchaseFoods");
    
    const usersCollection = client.db("tadooriFreshDB").collection("allUsers");

    // Generate jwt


    // Create Token


    // Get all Foods data from DB api
    app.get("/allfoods", async (req, res) => {
        const cursor = foodsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });


   // Save all Foods data in DB api
      app.post("/allFoods", async (req, res) => {
        const newFood = req.body;
        const result = await foodsCollection.insertOne(newFood);
        res.send(result);
      });

    //   Single food by ID
      app.get("/singleFood/:id", async (req, res) => {
        const id = req.params.id;
        const result = await foodsCollection.findOne({ _id: new ObjectId(id) });
        res.send(result);
      });



      // app.get("/myaddedfoods/:email", verify, async (req, res) => {
      //   if (req.user.email !== req.params.email) {
      //     return res.status(403).send({ message: "forbidden access" });
      //   }
  
      //   const result = await foodsCollection
      //     .find({ email: req.params.email })
      //     .toArray();
      //   res.send(result);
      // });

          // Gallery Collection api
    

          app.put("/updateCard/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedCard = req.body;
            const updateCard = {
              $set: {
                quantity: updatedCard.quantity,
                price: updatedCard.price,
                photoURL: updatedCard.photoURL,
                foodOrigin: updatedCard.foodOrigin,
                foodName: updatedCard.foodName,
                foodCategory: updatedCard.foodCategory,
                description: updatedCard.description,
              },
            };
            const result = await foodsCollection.updateOne(
              filter,
              updateCard,
              options
            );
            res.send(result);
          });

    
      app.get("/gallery", async (req, res) => {
        const cursor = galleryCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });
  
      app.post("/gallery", async (req, res) => {
        const newGallery = req.body;
        const result = await galleryCollection.insertOne(newGallery);
        res.send(result);
      });




      app.post("/users", async (req, res) => {
        const newUser = req.body;
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      });






          // for pagination

    app.get("/allFoodsForPagination", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const filter = req.query.filter;
      const sort = req.query.sort;
      const search = req.query.search;

      let query = {
        food_name: { $regex: search, $options: "i" },
      };

      if (filter) {
        query.food_category = filter;
      }

      let processes = [
        { $match: query },
        { $addFields: { numberPrice: { $toDouble: "$price" } } },
        { $sort: { numberPrice: sort === "low" ? 1 : -1 } },
        { $project: { numberPrice: 0 } },
        { $skip: size * page },
        { $limit: size },
      ];

      const result = await foodsCollection.aggregate(processes).toArray();
      res.send(result);
    });


    // data count
    app.get("/allFoodsCont", async (req, res) => {
      const filter = req.query.filter;
      const search = req.query.search;

      let query = {
        food_name: { $regex: search, $options: "i" },
      };
      if (filter) {
        query.food_category = filter;
      }
      const count = await foodsCollection.countDocuments(query);
      res.send({ count });
    });





    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
res.send('Tandoori server is running')
})


app.listen(port, () => {
    console.log(`Tandoori server is running on port: ${port}`)
})




