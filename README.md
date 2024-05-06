# Microservices RPC Example with RabbitMQ

This codebase demonstrates an example of microservices architecture using RabbitMQ as the message broker for communication between services. The project consists of three main components: Customer Service, Product Service, and an RPC (Remote Procedure Call) module.

## RPC Module

The `rpc.js` file contains the core functionality for implementing the RPC pattern using RabbitMQ. It provides the following functions:

1. `getChannel()`: Establishes a connection with RabbitMQ and returns a channel for sending and receiving messages.
2. `expensiveDBOperation()`: A dummy function that simulates an expensive database operation by introducing a 5-second delay.
3. `RPCObserver(RPC_QUEUE_NAME, fakeResponse)`: Acts as an RPC server, listening for requests on the specified queue and responding with the provided `fakeResponse`.
4. `requestData(RPC_QUEUE_NAME, requestPayload, uuid)`: Acts as an RPC client, sending a request to the specified queue with the given `requestPayload` and returning the response.
5. `RPCRequest()`: A higher-level function that generates a unique identifier (UUID) and calls `requestData` with the provided `RPC_QUEUE_NAME` and `requestPayload`.

## Customer Service

The `customer.js` file sets up an Express.js server for the Customer Service. It performs the following tasks:

1. Imports the required modules and functions from the `rpc` module.
2. Creates an Express application instance and configures middleware for parsing JSON and URL-encoded request bodies.
3. Defines a fake customer response object `fakeCustomerResponse`.
4. Starts the RPC Observer for the "CUSTOMER_RPC" queue with the `fakeCustomerResponse`.
5. Sets up a route handler for `GET /wishlist` that sends a request to the "PRODUCT_RPC" queue and returns the response data.
6. Sets up a root route handler that returns a simple "Customer Service" message.
7. Starts the server and listens on the specified port.

## Product Service

The `product.js` file sets up an Express.js server for the Product Service. It performs the following tasks:

1. Imports the required modules and functions from the `rpc` module.
2. Creates an Express application instance and configures middleware for parsing JSON and URL-encoded request bodies.
3. Defines a fake product response object `fakeProductResponse`.
4. Starts the RPC Observer for the "PRODUCT_RPC" queue with the `fakeProductResponse`.
5. Sets up a route handler for `GET /customer` that sends a request to the "CUSTOMER_RPC" queue and returns the response data.
6. Sets up a root route handler that returns a simple "Product Service" message.
7. Starts the server and listens on the specified port.

## Usage

To run this example, follow these steps:

1. Clone the repository: `git clone https://github.com/obinnafranklinduru/rpc-microservices-example`
2. Change directory to rpc-microservices-example: `cd rpc-microservices-example`
3. Install dependencies: `npm install`
4. Set up environment variables:
   - Create a `.env` file in the project root directory
   - Provide the variable `MSG_QUEUE_URL=your-MSG_QUEUE_URL-uri`
5. Start the server: `npm run start`
6. Open three separate terminal windows or tabs.

With all three services running, you can send requests to the Customer Service (`http://localhost:3000/wishlist`) or the Product Service (`http://localhost:4000/customer`) to observe the RPC communication between the services.

Note: This example uses fake responses for demonstration purposes. In a real-world scenario, you would replace the `fakeCustomerResponse` and `fakeProductResponse` with actual data fetched from databases or other data sources.

## License

This project is licensed under the [MIT License](https://github.com/obinnafranklinduru/rpc-microservices-example/blob/master/LICENSE).
