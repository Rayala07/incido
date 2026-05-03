import { MistralAIEmbeddings } from "@langchain/mistralai"
import { config } from "../config/config.js"

const embeddings = new MistralAIEmbeddings({
  apiKey: config.MISTRAL_API_KEY,
  model: "mistral-embed",
})

export async function getEmbedding(text) {
  return embeddings.embedQuery(text)
}
