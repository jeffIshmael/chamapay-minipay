import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

export async function GET(request: Request) {
  // 1. Auth check
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Your cron logic
  console.log('Cron job executed at:', new Date().toISOString());
  
  return NextResponse.json({ success: true });
}

