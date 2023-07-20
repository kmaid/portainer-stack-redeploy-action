import lib from "./lib";

// (portainerUrl, accessToken, stackId, endpointId)
const args = process.argv.slice(2);
console.log(args);
lib(args[0], args[1], args[2], args[3], args[4]).catch((error) =>
  console.log(error)
);
