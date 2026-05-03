import dotenv from "dotenv"
dotenv.config()

import { connectDB } from "../src/config/database.js"
import incidentModel from "../src/models/incident.model.js"
import { upsertIncidentRecord } from "../src/services/rag.service.js"

async function backfillPinecone() {
  try {
    await connectDB()
    console.log("✓ Connected to MongoDB")

    const incidents = await incidentModel.find().lean()
    console.log(`Found ${incidents.length} incidents to backfill...`)

    if (incidents.length === 0) {
      console.log("No incidents found.")
      process.exit(0)
    }

    let successCount = 0
    let errorCount = 0

    for (const incident of incidents) {
      try {
        await upsertIncidentRecord(incident)
        successCount++
        console.log(
          `✓ [${successCount}/${incidents.length}] Upserted: ${incident._id}`,
        )
      } catch (error) {
        errorCount++
        console.error(
          `✗ [${errorCount}] Failed to upsert ${incident._id}:`,
          error.message,
        )
      }
    }

    console.log("\n=== BACKFILL COMPLETE ===")
    console.log(`✓ Success: ${successCount}`)
    console.log(`✗ Failed: ${errorCount}`)
    console.log(`Total: ${incidents.length}`)

    process.exit(0)
  } catch (error) {
    console.error("Backfill failed:", error)
    process.exit(1)
  }
}

backfillPinecone()
