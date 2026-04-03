import { connect } from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create();
const mongo_uri = process.env.MONGO_URI
const inMemoryMongo_uri = mongod.getUri();
const environment = process.env.ENVIRONMENT

const connectMongoDb = async () =>
{
    try {
        if (environment === "TEST_FLIGHT") await connect(inMemoryMongo_uri);
        else await connect(mongo_uri.toString())
        console.log(`connected to mongoDb mode:${environment}`)

    } catch (err) {
        console.log(err)
        process.exit(1);
    }
}
export default connectMongoDb