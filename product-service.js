const http = require('http');
const { graphql } = require('graphql');
const schemas = require('./graphql-schemas');
const productSchema = schemas.productSchema;
const MongoClient = require('mongodb').MongoClient;

//const dburl = 'mongodb://localhost:27017';
const dburl = 'mongodb://localhost:27017';

// DB-Verbindung
const connectToDB = async () => {
    try {
        const client = await MongoClient.connect(dburl);
        console.log('Connected to the database');
        return client;
    } catch (error) {
        console.error('Failed to connect to the db', error);
    }
};

// Root-Objekt mit Resolver-Funktionen:
const root = {

    // Query um ein bestimmtes Produkt abzufragen
    product: async ({ id }) => {
        const client = await connectToDB();
        const db = client.db('productdb');
        const productsColl = db.collection('products');
        const product = await productsColl.findOne({ id: id });
        await client.close();
        return product;
    },

    // Query, um alle Produkte aus der mongoDB zu holen und als Liste zurückzugeben
    products: async () => {
        const client = await connectToDB();
        const db = client.db('productdb');
        const productsColl = db.collection('products');
        const products = await productsColl.find({}).toArray();
        return products;
    },

    // Query, um Produkte eines bestimmten Herstellers zu finden
    productsByProducer: async ({ producer }) => {
        const client = await connectToDB();
        const db = client.db('productdb');
        const productsColl = db.collection('products');
        const products = await productsColl.find({ producer: producer }).toArray();
        await client.close();
        return products;
    },

    // Query, um Produkte anhand eines Namens zu finden
    productsByName: async ({ name }) => {
        const client = await connectToDB();
        const db = client.db('productdb');
        const productsColl = db.collection('products');
        const products = await productsColl.find({ name: name }).toArray();
        await client.close();
        return products;
    },

    // Mutation, um ein neues Produkt in die mongoDB einzufügen
    addProduct: async ({ input }) => {
        console.log("addProduct wurde aufgerufen mit: ", input)
        const newProduct = input;
        const client = await connectToDB();
        const db = client.db('productdb');
        const productsColl = db.collection('products');
        await productsColl.insertOne(newProduct);
        await client.close();
        return newProduct;
    },

    // Mutation, um über ID ein bestimmtes Produkt zu löschen
    deleteProduct: async (id) => {
        const proId = id.id;
        const client = await connectToDB();
        const db = client.db('productdb');
        const productsColl = db.collection('products');
        const deleted = await productsColl.findOneAndDelete({ id: proId });
        await client.close();
        return deleted.value;
    }
};

// HTTP-Server für Port 8081
http.createServer(function (req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', function () {

        // Query vom Client in JSON parsen
        const { query } = JSON.parse(body);

        // Schema (andere Datei), Query (vom Client) und Root (mit Resolvern) einbinden
        graphql(productSchema, query, root).then((response) => { // Promise, wenn Antwort da (ist sie beim Aufruf noch nicht) zurücksenden
            res.end(JSON.stringify(response));
        });
    });
}).listen(8081, () => {
    console.log('Server läuft auf Port 8081');
});