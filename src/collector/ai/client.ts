import OpenAI from "openai";

function createClient(prefix: "SCORER" | "GENERATOR"): OpenAI {
  const baseURL =
    process.env[`${prefix}_BASE_URL`] || "https://open.bigmodel.cn/api/paas/v4";
  const apiKey = process.env[`${prefix}_API_KEY`] || "";
  const model = process.env[`${prefix}_MODEL`] || "glm-5.1";

  if (!apiKey) {
    throw new Error(
      `Missing ${prefix}_API_KEY environment variable. ` +
        `Set it in .env.local or GitHub Secrets.`,
    );
  }

  const client = new OpenAI({ apiKey, baseURL });
  return Object.assign(client, { defaultModel: model });
}

export interface ClientWithModel extends OpenAI {
  defaultModel: string;
}

export function createScorerClient(): ClientWithModel {
  return createClient("SCORER") as ClientWithModel;
}

export function createGeneratorClient(): ClientWithModel {
  return createClient("GENERATOR") as ClientWithModel;
}
