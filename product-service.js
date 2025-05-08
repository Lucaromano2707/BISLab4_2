const http = require('http');
const { graphql } = require('graphql');
const schemas = require('./graphql-schemas');
const productSchema = schemas.productSchema;
const MongoClient = require('mongodb').MongoClient;

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

// Root-Objekt mit Query auf products
const root = {
    products: async () => {
        const client = await connectToDB();
        const db = client.db('productdb');
        const productsColl = db.collection('products');
        const products = await productsColl.find({}).toArray();
        return products;
    }
};

// HTTP-Server für Port 8081
const server = http.createServer(async (req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const { query } = JSON.parse(body);
            const result = await graphql({
                schema: productSchema,
                source: query,
                rootValue: root
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        });
    } else {
        res.writeHead(405);
        res.end();
    }
});

server.listen(8081, () => {
    console.log('Server läuft auf Port 8081');
});