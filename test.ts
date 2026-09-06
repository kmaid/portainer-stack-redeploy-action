import lib from "./lib";

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log(
    "Usage: ts-node test.ts <portainerUrl> <accessToken> <stackId> [endpointId] [refName]"
  );
  process.exit(1);
}

lib(
  new URL(args[0]),
  args[1],
  parseInt(args[2], 10),
  args[3] ? parseInt(args[3], 10) : undefined,
  args[4]
)
  .then(() => console.log("Test succeeded"))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
