import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const filePath = path.join(process.cwd(), "data", "reports.json")

export async function GET() {
  const file = fs.readFileSync(filePath, "utf-8")
  const reports = JSON.parse(file)
  return NextResponse.json(reports)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.message || !body.user) {
    return NextResponse.json({ error: "Missing message or user" }, { status: 400 })
  }

  const file = fs.readFileSync(filePath, "utf-8")
  const reports = JSON.parse(file)

  const newReport = {
    id: Date.now(),
    user: body.user,
    message: body.message,
  }

  reports.unshift(newReport)
  fs.writeFileSync(filePath, JSON.stringify(reports, null, 2))
  return NextResponse.json(newReport)
}
