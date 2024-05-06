const express = require("express");
const { RPCObserver, RPCRequest } = require("./rpc");
require("dotenv").config();

const app = express(); // Creating an Express application instance
const port = process.env.CUSTOMER_PORT || 3000; // Defining the port number for the server

// Middleware
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies

// Fake customer response data
const fakeCustomerResponse = {
  _id: "yt686tu8763tgr98734",
  name: "Binna",
  country: "Nigeria",
};

// Start the RPC Observer for the "CUSTOMER_RPC" queue with the fake customer response
RPCObserver("CUSTOMER_RPC", fakeCustomerResponse);

// Route handler for GET /wishlist
app.get("/wishlist", async (req, res) => {
  try {
    // Payload for the product request
    const requestPayload = {
      productId: "123",
      customerId: "yt686tu8763tgr98734",
    };

    // Call the RPCRequest function with the "PRODUCT_RPC" queue and the request payload
    const responseData = await RPCRequest("PRODUCT_RPC", requestPayload);
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
  return res.status(200).json({ message: "Customer Service" });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
