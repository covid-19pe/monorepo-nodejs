import { DynamoDB } from "aws-sdk";

let dynamoDb;

if (process.env.STAGE === "local") {
    dynamoDb = new DynamoDB.DocumentClient({
        region: "localhost",
        endpoint: "http://localhost:4001",
        accessKeyId: "DEFAULT_ACCESS_KEY", // needed if you don't have aws credentials at all in env
        secretAccessKey: "DEFAULT_SECRET" // needed if you don't have aws credentials at all in env
    });

} else {
    dynamoDb = new DynamoDB.DocumentClient();
}


export const saveItem = ({ tableName, item }) => {
    const params = {
        TableName: tableName,
        Item: item
    };

    return dynamoDb
        .put(params)
        .promise()
        .then(() => item);
};

export const getItem = ({ tableName, keys }) => {
    const params = {
        TableName: tableName,
        Key: keys
    };


    console.log(params)

    return dynamoDb
        .get(params)
        .promise()
        .then(result => result.Item);
};