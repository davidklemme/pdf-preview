import { BlobServiceClient } from '@azure/storage-blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fileName } = await request.json();

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    );

    const containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME!
    );

    const blobClient = containerClient.getBlobClient(fileName);
    const downloadBlockBlobResponse = await blobClient.download();

    if (!downloadBlockBlobResponse.readableStreamBody) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Convert stream to buffer with correct typing
    const chunks: Buffer[] = [];
    for await (const chunk of downloadBlockBlobResponse.readableStreamBody) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Return the PDF file with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=${fileName}`,
      },
    });
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 500 });
  }
}
