
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();
const jwt =require('jsonwebtoken');

// middleware 
app.use(cors());
app.use(express.json());




app.get('/', (req, res) => {
    res.send('warehouse server is okkk');
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5c2ph.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const productCollection = client.db('warehouseManagement').collection('product');
        const myItemsCollection = client.db('warehouseManagement').collection('myItems');
        
       
        // use AUTH for extra security for login
        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.PRIVATE_JWT_KEY, {
                expiresIn: "10d"
            });

            res.send({ token });
        });






        //    get all  products api 
        app.get('/product', async (req, res) => {
            const page = parseInt(req.query.page)
            const PageSize = parseInt(req.query.size)
            const query = {};
            const cursor = productCollection.find(query);
            let products;
            if (page || PageSize) {

                products = await cursor.skip(page * PageSize).limit(PageSize).toArray();
            } else {

                products = await cursor.toArray();
            }
            res.send(products)

        })


        //    get all my  product products api 
        app.get('/myProduct', async (req, res) => {
            const query = {};
            const cursor = myItemsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)

        });

        // get my added product as my product's view
        app.get('/order', async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const cursor = myItemsCollection.find(query);
            const orders = await cursor.toArray();

            res.send(orders);
        });


        //   this api for count total product
        app.get('/productCount', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count });
        })


        // update a product's segment
        app.put('/product/:id', async (req, res) => {
            const updateProduct = req.body;
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateDoc = {
                $set: updateProduct
            }
            const result = await productCollection.updateOne(filter, updateDoc, option);
            res.send(result);
        });

        //   update product api
        app.put('/myItems/:id', async (req, res) => {
            const updateProduct = req.body;
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateDoc = {
                $set: updateProduct
            }
            const result = await myItemsCollection.updateOne(filter, updateDoc, option);
            res.send(result);
        });

        // add a product api
        app.post('/addProduct', async (req, res) => {
            const doc = req.body;
            const result = await myItemsCollection.insertOne(doc);
            res.send(result);
        });


        // delete a product api 
        app.delete('/myItems/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await myItemsCollection.deleteOne(query);
            res.send(result);
        });


      // find single product api
      app.get('/product/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await productCollection.findOne(query);
        res.send(result);
    })

       



    } finally {
        // await client.close()
    }


}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Listening Port:${port}`);
})
