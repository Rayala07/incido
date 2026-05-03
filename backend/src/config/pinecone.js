import { Pinecone } from "@pinecone-database/pinecone"
import { config } from "./config.js"

const pc = new Pinecone({
  apiKey: config.PINECONE_API_KEY,
})

const indexName = config.PINECONE_INDEX || "incido"

export const index = pc.index(indexName)
