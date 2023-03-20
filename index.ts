import { setFailed, setSecret, getInput } from "@actions/core";
import lib from "./lib";

const portainerUrl = new URL(getInput("portainerUrl"));
const accessToken = getInput("accessToken");
const stackId = parseInt(getInput("stackId"));
const endpointId = parseInt(getInput("endpointId"));

if (isNaN(stackId)) {
  setFailed("Stack ID must be integer");
  process.exit(1);
}

setSecret(portainerUrl.toString());
setSecret(accessToken);

lib(portainerUrl, accessToken, stackId, endpointId).catch((error) => {
  setFailed(error.message);
  process.exit(2);
});
