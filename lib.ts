import { Axios } from "axios";
import { Agent } from "https";

export interface StackEnv {
  name: string;
  value: string;
}

export interface StackGitAuth {
  Username?: string;
  Password?: string;
}

export interface StackGitConfig {
  URL?: string;
  ReferenceName?: string;
  ConfigFilePath?: string;
  Authentication?: StackGitAuth | null;
  ConfigHash?: string;
}

export interface StackData {
  Id: number;
  Name: string;
  Env?: StackEnv[];
  GitConfig?: StackGitConfig | null;
  WorkflowID?: number;
  Status?: number;
}

export default async (
  portainerUrl: URL,
  accessToken: string,
  stackId: number,
  endpointId?: number,
  repositoryReferenceName?: string
): Promise<void> => {
  const client = new Axios({
    baseURL: portainerUrl.toString(),
    httpsAgent: new Agent({ rejectUnauthorized: false }),
    headers: {
      "X-API-Key": accessToken,
    },
    validateStatus: () => true,
  });

  const getStackRes = await client.get(`/api/stacks/${stackId}`);
  if (getStackRes.status < 200 || getStackRes.status >= 300) {
    throw new Error(
      `Failed to fetch stack ${stackId} (${getStackRes.status}): ${getStackRes.data}`
    );
  }

  const stackData: StackData =
    typeof getStackRes.data === "string"
      ? JSON.parse(getStackRes.data)
      : getStackRes.data;

  const env = stackData.Env ?? [];
  const username = stackData.GitConfig?.Authentication?.Username ?? "";
  const hasAuth = Boolean(username);
  const refName =
    repositoryReferenceName ||
    stackData.GitConfig?.ReferenceName ||
    "refs/heads/master";

  const redeployPayload = {
    Env: env,
    RepositoryReferenceName: refName,
    RepositoryAuthentication: hasAuth,
    RepositoryUsername: username,
    RepositoryPassword: "",
    PullImage: true,
    prune: true,
  };

  const redeployRes = await client.put(
    `/api/stacks/${stackId}/git/redeploy`,
    JSON.stringify(redeployPayload),
    {
      headers: {
        "Content-Type": "application/json",
      },
      params: endpointId ? { endpointId } : undefined,
    }
  );

  if (redeployRes.status < 200 || redeployRes.status >= 300) {
    throw new Error(
      `Failed to redeploy stack ${stackId} (${redeployRes.status}): ${redeployRes.data}`
    );
  }

  console.log(
    `Successfully triggered redeploy for stack ${stackId} (${stackData.Name})`
  );
};
