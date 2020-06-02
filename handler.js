/* This is where the functions live that the functions section of the YAML file points to. These functions get added to Lambda, where
they'll run in their own containers (kind of like Docker) when they receive a request to the path/method specified in the YAML. */

// Enables strict mode, which makes things that normally cause warnings error out (keeps the code cleaner).

'use strict';

// Requires AWS (installed and logged in globally on your computer)

const AWS = require('aws-sdk');

// Creates a new DynamoDB database with AWS.

const dataBase = new AWS.DynamoDB.DocumentClient({ apiVersion: '2019.11.21' });

// Require UUID (universally unique identifier) to create item IDs.

const { v4: uuidv4 } = require('uuid');

// Assigns the table set up in the .yml to a variable to be used in the CRUD functions.

const pixelVisionTable = process.env.PIXEL_VISION_POSTS;

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

module.exports.addNewPost = (event, context, callback) => {
  // Parses the whole body out of the event (the request) and assigns it to a variable.

  const requestBody = JSON.parse(event.body);

  const item = {
    //creates the item that will then be added to the database, including the bits from the request body
    id: uuidv4(), //uses uuid to generate a new unique id for the item
    createdAt: new Date().toISOString(), //automatically adds a human-readable date to the item as well
    name: reqBody.name, //destructures the name string out of the request body and saves it to the name key for the database
    definition: reqBody.definition, //destructures the definition string out of the request body and saves it to the definition key for the database
  };

  return db
    .put({
      //passes the table name and the item we just created above to the put
      //NOTE: even though it's creating a new item and is set up in the YAML to respond to post requests, you still use put here when it's talking directly to DynamoDB (it puts a new item rather than putting a replacement here)
      TableName: demoTable,
      Item: item,
    })
    .promise()
    .then(() => {
      callback(null, response(200, item));
    })
    .catch((err) => response(null, response(err.statusCode, err)));
};
