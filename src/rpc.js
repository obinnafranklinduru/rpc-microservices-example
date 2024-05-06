const amqplib = require("amqplib");
const { v4: uuid4 } = require("uuid");
require("dotenv").config();

// Initialize a connection to the RabbitMQ server
let amqplibConnection = null;

// Function to establish a connection with RabbitMQ and return a channel
const getChannel = async () => {
  try {
    // If no connection exists, create a new one
    if (amqplibConnection === null) {
      amqplibConnection = await amqplib.connect(process.env.MSG_QUEUE_URL);
    }

    // Return a new channel from the existing connection
    return await amqplibConnection.createChannel();
  } catch (error) {
    console.error(error.message);
  }
};

// Function to simulate an expensive database operation
const expensiveDBOperation = (payload, fakeResponse) => {
  console.log(payload); // Log the payload received
  console.log(fakeResponse); // Log the fake response

  // Return a Promise that resolves after 5 seconds with the fakeResponse
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(fakeResponse);
    }, 5000);
  });
};

// Function to act as an RPC server
const RPCObserver = async (RPC_QUEUE_NAME, fakeResponse) => {
  try {
    const channel = await getChannel(); // Get a channel from RabbitMQ

    // Declare a non-durable queue with the given name
    await channel.assertQueue(RPC_QUEUE_NAME, { durable: false });
    channel.prefetch(1); // Limit the number of unacknowledged messages to 1

    // Consume messages from the RPC queue
    channel.consume(
      RPC_QUEUE_NAME,
      async (msg) => {
        if (msg.content) {
          // Parse the message content as JSON
          const payload = JSON.parse(msg.content.toString());
          // Call the expensive database operation with the payload and fake response
          const response = await expensiveDBOperation(payload, fakeResponse);

          // Send the response back to the client
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );

          channel.ack(msg); // Acknowledge the message
        }
      },
      { noAck: false } // Manually acknowledge messages
    );
  } catch (error) {
    console.error(error.message);
  }
};

// Function to act as an RPC client
const requestData = async (RPC_QUEUE_NAME, requestPayload, uuid) => {
  try {
    const channel = await getChannel(); // Get a channel from RabbitMQ

    // Declare an exclusive queue to receive responses
    const q = await channel.assertQueue("", { exclusive: true });

    // Send the request payload to the RPC queue
    channel.sendToQueue(
      RPC_QUEUE_NAME,
      Buffer.from(JSON.stringify(requestPayload)),
      { replyTo: q.queue, correlationId: uuid }
    );

    // Return a Promise that resolves with the response or times out after 8 seconds
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        channel.close();
        resolve("API could not fullfil the request!");
      }, 8000);

      // Consume messages from the response queue
      channel.consume(
        q.queue,
        (msg) => {
          if (msg.properties.correlationId == uuid) {
            resolve(JSON.parse(msg.content.toString()));
            clearTimeout(timeout);
          } else {
            reject("data Not found!");
          }
        },
        { noAck: true } // Automatically acknowledge messages
      );
    });
  } catch (error) {
    console.log(error.message);
    return "error";
  }
};

// Function to initiate an RPC request
const RPCRequest = async () => {
  try {
    const uuid = uuid4(); // Generate a unique identifier
    return await requestData(RPC_QUEUE_NAME, requestPayload, uuid);
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = {
  getChannel,
  RPCObserver,
  RPCRequest,
};
