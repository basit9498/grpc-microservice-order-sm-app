// const grpc = require("grpc");
// const protoLoader = require("@grpc/proto-loader");

// const userProtoUrl = "http://localhost:8000/user.proto";
// const orderProtoUrl = "http://localhost:8000/order.proto";

// // Load user proto remotely
// const userPackageDefinition = protoLoader.loadSync(userProtoUrl, {
//   keepCase: true,
//   longs: String,
//   enums: String,
//   defaults: true,
//   oneofs: true,
// });

// // Load order proto remotely
// const orderPackageDefinition = protoLoader.loadSync(orderProtoUrl, {
//   keepCase: true,
//   longs: String,
//   enums: String,
//   defaults: true,
//   oneofs: true,
// });

// // Load order proto
// // const orderPackageDefinition = protoLoader.loadSync(
// //   "../protos/order.proto",
// //   {}
// // );
// const orderProto = grpc.loadPackageDefinition(orderPackageDefinition).order;

// // Load user proto
// // const userPackageDefinition = protoLoader.loadSync("../protos/user.proto", {});
// const userProto = grpc.loadPackageDefinition(userPackageDefinition).user;

// // Create a client for the user service
// const userClient = new userProto.UserService(
//   "localhost:50051",
//   grpc.credentials.createInsecure()
// );

// const orders = [
//   { id: 1, item: "Laptop", userId: 1 },
//   { id: 2, item: "Phone", userId: 2 },
// ];

// const server = new grpc.Server();

// server.addService(orderProto.OrderService.service, {
//   GetOrders: (call, callback) => {
//     // Fetch user data from user-service
//     userClient.GetUsers({}, (error, response) => {
//       if (error) {
//         callback(error);
//       } else {
//         console.log("response", response);
//         const users = response.users;
//         const ordersWithUserDetails = orders.map((order) => ({
//           ...order,
//           user: users.find((user) => user.id === order.userId),
//         }));
//         console.log("ordersWithUserDetails", ordersWithUserDetails);
//         callback(null, { orders: ordersWithUserDetails });
//       }
//     });
//   },
// });

// server.bind("127.0.0.1:50052", grpc.ServerCredentials.createInsecure());
// console.log("Order service running at http://127.0.0.1:50052");
// server.start();

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const axios = require("axios");
const fs = require("fs").promises;

async function loadProto(url) {
  const response = await axios.get(url);
  const tempPath = "./temp.proto";
  console.log("response", response);
  await fs.writeFile(tempPath, response.data);
  const packageDefinition = protoLoader.loadSync(tempPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  await fs.unlink(tempPath); // Clean up temp file
  return packageDefinition;
}

(async () => {
  try {
    // Load the user.proto file from the dummy server
    const userPackageDefinition = await loadProto(
      "http://localhost:8000/protos/user.proto"
    );
    const userProto = grpc.loadPackageDefinition(userPackageDefinition);

    // Load the order.proto file from the dummy server
    const orderPackageDefinition = await loadProto(
      "http://localhost:8000/protos/order.proto"
    );
    const orderProto = grpc.loadPackageDefinition(orderPackageDefinition);

    // Create a client for the user service
    const userClient = new userProto.user.UserService(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );

    const orders = [
      { id: 1, item: "Laptop", userId: 1 },
      { id: 2, item: "Phone", userId: 2 },
    ];

    const server = new grpc.Server();

    server.addService(orderProto.order.OrderService.service, {
      GetOrders: (call, callback) => {
        // Fetch user data from user-service
        console.log("call");
        userClient.GetUsers({}, (error, response) => {
          console.log("response", response);
          if (error) {
            callback(error);
          } else {
            const users = response.users;
            const ordersWithUserDetails = orders.map((order) => ({
              ...order,
              user: users.find((user) => user.id === order.userId),
            }));
            console.log("ordersWithUserDetails", ordersWithUserDetails);
            callback(null, { orders: ordersWithUserDetails });
          }
        });
      },
    });

    server.bindAsync(
      "127.0.0.1:50052",
      grpc.ServerCredentials.createInsecure(),
      () => {
        console.log("Order service running at http://127.0.0.1:50052");
        server.start();
      }
    );
  } catch (error) {
    console.error("Error loading proto files:", error);
  }
})();
