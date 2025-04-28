// app/api/chamas/[chamaId]/messages/route.ts

import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/db'; // Ensure this path is correct
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


export async function GET(
  request: NextRequest,
  { params }: { params: { chamaId: string } }
) {
  const chamaId = parseInt(params.chamaId, 10);

  if (isNaN(chamaId)) {
    return NextResponse.json({ error: 'Invalid chama ID' }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { chamaId },
      orderBy: { timestamp: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });

    // Format messages
    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      text: msg.text,
      senderId: msg.senderId,
      sender: msg.sender.name || 'Anonymous',
      timestamp: msg.timestamp,
    }));

    return NextResponse.json({ messages: formattedMessages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chamaId: string } }
) {
  const chamaId = parseInt(params.chamaId, 10);
  const { senderId, text } = await request.json();

  if (isNaN(chamaId) || !senderId || !text) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const message = await prisma.message.create({
      data: {
        chamaId,
        senderId,
        text,
      },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });

    const formattedMessage = {
      id: message.id,
      text: message.text,
      sender: message.sender.name || 'Anonymous',
      timestamp: message.timestamp,
    };

    return NextResponse.json({ message: formattedMessage }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
