/* This is where the functions live that the functions section of the YAML file points to. These functions get added to Lambda, where
they'll run in their own containers (kind of like Docker) when they receive a request to the path/method specified in the YAML. */

// Enables strict mode, which makes things that normally cause warnings error out (keeps the code cleaner).

'use strict';

// Requires AWS (installed and logged in globally on your computer)

const AWS = require('aws-sdk');

// Creates a new DynamoDB database with AWS.

const dataBase = new AWS.DynamoDB.DocumentClient({ apiVersion: '2019.11.21' });

// Require UUID (universally unique identifier) to create item IDs - not currently using.

// const { v4: uuidv4 } = require('uuid');

// Assigns the table set up in the .yml to a variable to be used in the CRUD functions.

const pixelVisionTable = process.env.PIXEL_VISION_TABLE;

//---------HELPER FUNCTION TO SEND RESPONSE JSONS WITH HEADERS:---------

/* The createResponse function that adds headers to a response object. It takes in a status code and a message which will form the 
body of the response. */

function createResponse(statusCode, message) {
  return {
    statusCode: statusCode,
    //gives us back the status code it's received
    headers: {
      //sticks all the right headers on to talk to the request during the preflight check (CORS)
      'Access-Control-Allow-Headers': 'Content-Type', //all fetch requests on the front end need 'Content-Type': 'application/json' as a header!!
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'GET, OPTIONS, POST, PUT, DELETE',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message), //stringifies the message object into JSON
  };
}

//---------CREATE NEW ITEM:---------

function addNewPost(event, context, callback) {
  // Parses the whole body out of the event (the request) and assigns it to a variable.

  const requestBody = JSON.parse(event.body);

  const {
    id,
    number,
    type,
    image,
    alt,
    title,
    date,
    link,
    text,
    comments,
  } = requestBody;

  // The item that will be added to the database, made up of a uuid and the request body.

  const item = {
    id,
    number,
    type,
    image,
    alt,
    title,
    date,
    link,
    text,
    comments,
  };

  // Puts the item in the database by using the database name and the item variables. PUT is used rather than POST for DynamoDB.

  return dataBase
    .put({
      TableName: pixelVisionTable,
      Item: item,
    })
    .promise()
    .then(() => {
      callback(null, createResponse(200, item));
    })
    .catch((error) =>
      createResponse(null, createResponse(error.statusCode, error))
    );
}

//---------GET ALL ITEMS IN THE TABLE:---------

function getAllPosts(event, context, callback) {
  // Creates and returns an instance of DynamoDB.

  return (
    dataBase

      // Scan is a DynamoDB method that gets all of items in a table.

      .scan({
        TableName: pixelVisionTable, //which table to scan
      })

      // Returns a promise which, once completed, will contain all of the items in the table.

      .promise()

      //Status code 200 for success. Response contains a JSON with all of the items in the table

      .then((response) => callback(null, createResponse(200, response.Items)))

      // Catches any errors returned from the promise.

      .catch((error) => callback(null, createResponse(error.statusCode, error)))
  );
}

//---------GET A ITEM BY ID:---------

function getPostById(event, context, callback) {
  // Gets the id out of the parameters of the event aka the request (the equivalent of doing req.params).

  const id = event.pathParameters.id;

  /* Separate params object to tell the db which table and to use the id as the key (which will work because we set up the id in the 
YAML to be the partition key) */

  const params = {
    TableName: pixelVisionTable,
    Key: {
      id: id,
    },
  };

  return (
    dataBase

      // Passes the params object to get to use it to look for the id in the table

      .get(params)
      .promise()
      .then((response) => {
        // Checks if there's an item with that ID. If so, it's stored in res.Item

        if (response.Item) callback(null, createResponse(200, response.Item));
        // If it doesn't find anything with that id, you send a 404 error instead.
        else
          callback(
            null,
            createResponse(404, { error: 'No item with that name found' })
          );
      })
      .catch((error) => callback(null, createResponse(error.statusCode, error)))
  );
}

//---------GET A ITEM BY ID:---------

function updatePostById(event, context, callback) {
  // Gets the id out of the parameters of the event aka the request (the equivalent of doing req.params).

  const id = event.pathParameters.id;
  const requestBody = JSON.parse(event.body);
  const { comments } = requestBody;

  /* Separate params object to tell the db which table and to use the id as the key (which will work because we set up the id in the 
YAML to be the partition key) */

  const params = {
    TableName: pixelVisionTable,
    Key: {
      id: id,
    },
    UpdateExpression: 'set comments = :c',
    ExpressionAttributeValues: {
      ':c': comments,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  return (
    dataBase

      // Passes the params object to get to use it to look for the id in the table

      .update(params)
      .promise()
      .then((response) => {
        // Checks if there's an item with that ID. If so, it's stored in res.Item
        console.log(response);
        if (response.Item) callback(null, createResponse(200, response.Item));
        // If it doesn't find anything with that id, you send a 404 error instead.
        else
          callback(
            null,
            createResponse(404, { error: 'No item with that name found' })
          );
      })
      .catch((error) => callback(null, createResponse(error.statusCode, error)))
  );
}

module.exports = { addNewPost, getAllPosts, getPostById, updatePostById };
