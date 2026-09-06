import { Agent, setGlobalDispatcher } from "undici";

// Allow self-signed certificates if user hosts Portainer with self-signed TLS
try {
  setGlobalDispatcher(
    new Agent({
      connect: {
        rejectUnauthorized: false,
      },
    })
  );
} catch {
  // If dispatcher setup fails or is unsupported, continue with default fetch
}

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
  const base = portainerUrl.toString().replace(/\/+$/, "");
  const stackUrl = new URL(`${base}/api/stacks/${stackId}`);

  const getStackRes = await fetch(stackUrl, {
    method: "GET",
    headers: {
      "X-API-Key": accessToken,
    },
  });

  const getStackText = await getStackRes.text();
  if (!getStackRes.ok) {
    throw new Error(
      `Failed to fetch stack ${stackId} (${getStackRes.status}): ${getStackText}`
    );
  }

  const stackData: StackData = JSON.parse(getStackText);

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

  const redeployUrl = new URL(`${base}/api/stacks/${stackId}/git/redeploy`);
  if (endpointId) {
    redeployUrl.searchParams.set("endpointId", String(endpointId));
  }

  const redeployRes = await fetch(redeployUrl, {
    method: "PUT",
    headers: {
      "X-API-Key": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(redeployPayload),
  });

  const redeployText = await redeployRes.text();
  if (!redeployRes.ok) {
    throw new Error(
      `Failed to redeploy stack ${stackId} (${redeployRes.status}): ${redeployText}`
    );
  }

  console.log(
    `Successfully triggered redeploy for stack ${stackId} (${stackData.Name})`
  );
};
