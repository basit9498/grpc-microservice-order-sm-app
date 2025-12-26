// const grpc = require("grpc");
// const protoLoader = require("@grpc/proto-loader");
// const packageDefinition = protoLoader.loadSync("../protos/user.proto", {});
// const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// const users = [
//   { id: 1, name: "Alice", phone: "0923423" },
//   { id: 2, name: "Bob", phone: "8765" },
// ];

// const server = new grpc.Server();

// server.addService(userProto.UserService.service, {
//   GetUsers: (call, callback) => {
//     callback(null, { users });
//   },
// });

// server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure());
// console.log("User service running at http://127.0.0.1:50051");
// server.start();

const axios = require("axios");
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const fs = require("fs").promises;

// working on new 

// async function loadProto(url) {
//   try {
//     console.log("Fetching proto file from:", url);
//     const response = await axios.get(url);
//     console.log("Proto file content:", response.data);

//     const packageDefinition = protoLoader.loadSync(response.data, {
//       keepCase: true,
//       longs: String,
//       enums: String,
//       defaults: true,
//       oneofs: true,
//     });

//     return grpc.loadPackageDefinition(packageDefinition);
//   } catch (error) {
//     console.error("Error loading proto file:", error);
//     throw error; // Re-throw the error to handle it further if needed
//   }
// }

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
    // const userProto = await loadProto(
    //   "http://localhost:8000/protos/user.proto"
    // );
    const userPackageDefinition = await loadProto(
      "http://localhost:8000/protos/user.proto"
    );
    const userProto = grpc.loadPackageDefinition(userPackageDefinition);

    const users = [
      { id: 1, name: "Alice", phone: "0923423" },
      { id: 2, name: "Bob", phone: "8765" },
    ];

    const server = new grpc.Server();

    server.addService(userProto.user.UserService.service, {
      GetUsers: (call, callback) => {
        console.log("called");
        callback(null, { users });
      },
    });

    server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure());
    console.log("User service running at http://127.0.0.1:50051");
    server.start();
  } catch (error) {
    console.error("Error loading proto files:", error);
  }
})();
