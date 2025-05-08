const { buildSchema } = require('graphql');

const productSchema = buildSchema(`
    type Product {
        id: String!
        name: String!
        producer: String
        prodtype: String
        subtype: String
        price: Float
        details: BikeDetails
    }

    type BikeDetails {
        material: String
        color: [String]
        size: [Int]
        group: String
        cassette: String
        rim: String
        tire: String
        brakes: String
        handlebar: String
    }

    input ProductInput {
        id: String!
        name: String!
        producer: String
        prodtype: String
        subtype: String
        price: Float
        details: BikeDetailsInput
    }

    input BikeDetailsInput {
        material: String
        color: [String]
        size: [Int]
        group: String
        cassette: String
        rim: String
        tire: String
        brakes: String
        handlebar: String
    }

    type Query {
        product(id: String!): Product
        products: [Product]
        productsByProducer(producer: String!): [Product]
        productsByName(name: String!): [Product]
    }

    type Mutation {
        addProduct(input: ProductInput): Product
        deleteProduct(id: String!): Product
    }
`);

exports.productSchema = productSchema;