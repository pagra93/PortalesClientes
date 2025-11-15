import { NextResponse } from 'next/server';

/**
 * Health check endpoint para Docker y monitoreo
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

