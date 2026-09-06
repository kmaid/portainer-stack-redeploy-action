import { setFailed, setSecret, getInput } from "@actions/core";
import lib from "./lib";

try {
  const urlInput = getInput("portainerUrl", { required: true });
  const portainerUrl = new URL(urlInput);
  const accessToken = getInput("accessToken", { required: true });
  const repositoryReferenceName = getInput("repositoryReferenceName") || undefined;
  const stackIdInput = getInput("stackId", { required: true });
  const endpointIdInput = getInput("endpointId");

  const stackId = parseInt(stackIdInput, 10);
  const endpointId = endpointIdInput ? parseInt(endpointIdInput, 10) : undefined;

  if (isNaN(stackId)) {
    setFailed("Stack ID must be integer");
    process.exit(1);
  }

  setSecret(portainerUrl.toString());
  setSecret(accessToken);

  lib(
    portainerUrl,
    accessToken,
    stackId,
    endpointId,
    repositoryReferenceName
  ).catch((error: Error) => {
    setFailed(error.message);
    process.exit(2);
  });
} catch (error: any) {
  setFailed(error.message || String(error));
  process.exit(1);
}
