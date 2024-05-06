const express = require("express");
const { RPCObserver, RPCRequest } = require("./rpc");
require("dotenv").config();

const app = express(); // Creating an Express application instance
const port = process.env.PRODUCT_PORT || 4000; // Defining the port number for the server

// Middleware
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies

// Fake product response data
const fakeProductResponse = {
  _id: "yt686tu8763tgr98734",
  title: "Android Phone",
  price: "$100",
};

// Start the RPC Observer for the "PRODUCT_RPC" queue with the fake product response
RPCObserver("PRODUCT_RPC", fakeProductResponse);

// Route handler for GET /customer
app.get("/customer", async (req, res) => {
  try {
    // Payload for the customer request
    const requestPayload = { customerId: "yt686tu8763tgr98734" };

    // Call the RPCRequest function with the "CUSTOMER_RPC" queue and the request payload
    const responseData = await RPCRequest("CUSTOMER_RPC", requestPayload);
    console.log(responseData); // Log the response data

    // Send the response data as JSON with a 200 status code
    return res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

// Route handler for GET /
app.get("/*", (req, res) => {
  // Send a simple JSON response
  return res.status(200).json({ message: "Product Service" });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
