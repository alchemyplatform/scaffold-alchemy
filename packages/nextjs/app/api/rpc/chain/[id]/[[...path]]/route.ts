import { getChainById } from "@scaffold-alchemy/shared";

const DEFAULT_ALCHEMY_GAS_POLICY_ID = "f0d2920d-b0dc-4e55-ab21-2fcb483bc293";
const DEFAULT_ALCHEMY_API_KEY = "Aau4vg0U-46T4ZI857caO7otLxX3RVSo";

export async function POST(req: Request, { params }: { params: { id: string; path: string[] } }) {
  const { id, path } = params;
  const chain = getChainById(parseInt(id));
  if (!chain) {
    return new Response(`Chain not found: ${chain}`, {
      status: 404,
    });
  }
  const rpcUrl = chain.rpcUrls.alchemy.http[0];

  const apiKey = process.env.ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY;
  if (!apiKey) {
    return new Response("ALCHEMY_API_KEY is not set", {
      status: 500,
    });
  }

  const body = await req.json();

  try {
    let combinedPath;
    if (path && path.find(x => x === "signer")) {
      combinedPath = "https://api.g.alchemy.com/" + path.join("/");
    } else {
      combinedPath = rpcUrl + "/" + apiKey;
    }

    if (body.method === "alchemy_requestGasAndPaymasterAndData") {
      console.log(body.params);
      body.params[0].policyId = process.env.GAS_MANAGER_POLICY_ID || DEFAULT_ALCHEMY_GAS_POLICY_ID;
      console.log(body.params);
    }

    const apiResponse = await fetch(combinedPath, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await apiResponse.json();
    const headers = new Headers(apiResponse.headers);
    const originalSetCookie = headers.get("set-cookie");
    headers.delete("content-encoding");
    headers.delete("transfer-encoding");
    headers.set("Content-Type", "application/json");
    if (originalSetCookie) {
      const rewritten = originalSetCookie.replace(/;?\s*Secure/gi, "").replace(/;?\s*SameSite=None/gi, "");
      headers.set("Set-Cookie", rewritten);
    }

    return new Response(JSON.stringify(data), {
      status: apiResponse.status,
      headers,
    });
  } catch (error) {
    console.error(error);
    return new Response("Server error occurred", {
      status: 500,
    });
  }
}
