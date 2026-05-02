import express from "express"
import { getOpenActionItemCount } from "../controllers/actionItem.controller.js"
import { verifyUser } from "../middlewares/verifyuser.js"

const actionItemRouter = express.Router()

actionItemRouter.get("/open-count", verifyUser, getOpenActionItemCount)

export default actionItemRouter
