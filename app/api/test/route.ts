import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      message: "Test API working successfully",
      status: "OK"
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      message: "Test failed",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 