import { getEmbedding } from "./embedding.service.js"
import { index } from "../config/pinecone.js"

const INCIDENT_NAMESPACE = "incidents"

function toPineconeId(incidentId) {
  return `incident-${incidentId}`
}

function buildIncidentText(incident) {
  const title = incident?.title || ""
  const description = incident?.description || ""
  const severity = incident?.severity || ""
  const status = incident?.status || ""
  const affectedServices = Array.isArray(incident?.affectedServices)
    ? incident.affectedServices.join(", ")
    : ""

  return [
    `Title: ${title}`,
    `Description: ${description}`,
    `Severity: ${severity}`,
    `Status: ${status}`,
    `Affected Services: ${affectedServices}`,
  ].join("\n")
}

export async function upsertIncidentRecord(incident) {
  const incidentId = incident?._id?.toString()
  if (!incidentId) {
    throw new Error("Incident _id is required for Pinecone upsert")
  }

  const textForEmbedding = buildIncidentText(incident)
  const embedding = await getEmbedding(textForEmbedding)

  await index.upsert({
    namespace: INCIDENT_NAMESPACE,
    records: [
      {
        id: toPineconeId(incidentId),
        values: embedding,
        metadata: {
          incidentId,
          title: incident?.title || "",
          severity: incident?.severity || "",
          status: incident?.status || "",
          projectId: incident?.projectId?.toString?.() || "",
          createdAt: incident?.createdAt
            ? new Date(incident.createdAt).toISOString()
            : new Date().toISOString(),
        },
      },
    ],
  })

  return {
    namespace: INCIDENT_NAMESPACE,
    id: toPineconeId(incidentId),
  }
}

export async function deleteIncidentRecord(incidentId) {
  if (!incidentId) {
    throw new Error("Incident ID is required for Pinecone delete")
  }

  await index.deleteOne({
    id: toPineconeId(incidentId.toString()),
    namespace: INCIDENT_NAMESPACE,
  })

  return {
    namespace: INCIDENT_NAMESPACE,
    id: toPineconeId(incidentId.toString()),
  }
}

export async function getRagStatusReport() {
  const stats = await index.describeIndexStats()
  const namespaces = stats?.namespaces || {}
  const incidentNamespaceStats = namespaces[INCIDENT_NAMESPACE] || {
    recordCount: 0,
  }

  return {
    indexDimension: stats?.dimension || 0,
    totalRecordCount: stats?.totalRecordCount || 0,
    incidentNamespace: INCIDENT_NAMESPACE,
    incidentRecordCount: incidentNamespaceStats.recordCount || 0,
  }
}

export async function findSimilarIncidents(description, minScore = 0.75) {
  const embedding = await getEmbedding(description)

  const result = await index.query({
    namespace: INCIDENT_NAMESPACE,
    vector: embedding,
    topK: 5,
    includeMetadata: true,
  })

  const filtered = result.matches.filter((match) => match.score >= minScore)
  return filtered.length > 0 ? filtered : result.matches.slice(0, 3)
}

// Apply time decay to match scores - recent incidents weighted higher
export function applyTimeDecay(matches, currentDate = new Date()) {
  return matches.map((match) => {
    const incidentDate = match.metadata?.createdAt
      ? new Date(match.metadata.createdAt)
      : currentDate

    const ageInDays = (currentDate - incidentDate) / (1000 * 60 * 60 * 24)
    const decayFactor = Math.exp(-ageInDays / 90)

    return {
      ...match,
      originalScore: match.score,
      score: match.score * decayFactor,
      freshness: decayFactor.toFixed(2),
    }
  })
}

// Detect if issue is recurring (3+ similar incidents)
export function detectRecurrence(matches, threshold = 3) {
  return {
    isRecurring: matches.length >= threshold,
    count: matches.length,
    severity: matches.length >= threshold ? "high" : "low",
  }
}
