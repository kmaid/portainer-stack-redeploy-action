import { Axios } from "axios";
import { Agent } from "https";

export default async (portainerUrl, accessToken, stackId, endpointId) => {
  const client = new Axios({
    baseURL: portainerUrl.toString(),
    httpsAgent: new Agent({ rejectUnauthorized: false }),
    headers: {
      "X-API-Key": accessToken,
    },
  });
  const {
    Env,
    GitConfig: {
      Authentication: { Username },
    },
  } = JSON.parse((await client.get(`/api/stacks/${stackId}`)).data);

  const response = await client.put(
    `/api/stacks/${stackId}/git/redeploy`,
    JSON.stringify({
      Env,
      RepositoryReferenceName: "",
      RepositoryAuthentication: true,
      RepositoryUsername: Username,
      RepositoryPassword: "",
      PullImage: true,
      prune: true,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      params: { endpointId },
    }
  );
};
