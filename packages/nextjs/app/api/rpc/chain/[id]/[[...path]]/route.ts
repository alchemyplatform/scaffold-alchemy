import { ALCHEMY_CONFIG, getChainById } from "@scaffold-alchemy/shared";

export async function POST(req: Request, { params }: { params: { id: string; path: string[] } }) {
  const { id, path } = params;
  const chain = getChainById(parseInt(id));
  if (!chain) {
    return new Response(`Chain not found: ${chain}`, {
      status: 404,
    });
  }
  const rpcUrl = chain.rpcUrls.alchemy.http[0];

  const apiKey = ALCHEMY_CONFIG.ALCHEMY_API_KEY;
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
      body.params[0].policyId = ALCHEMY_CONFIG.ALCHEMY_GAS_POLICY_ID;
    }

    const apiResponse = await fetch(combinedPath, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await apiResponse.json();
    const headers = new Headers(apiResponse.headers);
    headers.delete("transfer-encoding");
    headers.delete("content-encoding");
    headers.delete("content-length");
    return new Response(JSON.stringify(json), {
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
