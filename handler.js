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

module.exports.addNewPost = (event, context, callback) => {
  // Parses the whole body out of the event (the request) and assigns it to a variable.

  console.log(event);

  const requestBody = JSON.parse(event.body);

  // const { type, image, title, date, link, text } = requestBody;

  // The item that will be added to the database, made up of a uuid and the request body.

  const item = {
    id: uuidv4(),
    type: requestBody.type,
    image: requestBody.image,
    title: requestBody.title,
    date: requestBody.date,
    link: requestBody.link,
    text: requestBody.text,
    comments: requestBody.comments,
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
};
