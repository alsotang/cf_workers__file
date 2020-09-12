// per chunk size should not reach worker's memory limit
// https://developers.cloudflare.com/workers/platform/limits
const MAX_CHUNK_SIZE = 1024 * 1024 * 50; // 50MB

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  const desiredSize = getDesiredSize(url.pathname);
  let sendedSize = 0;

  let { readable, writable } = new TransformStream()

  // return the readable first, then write to it
  setTimeout(async () => {
    const writer = writable.getWriter()

    // use stream to keep memory usage small enough
    while (sendedSize < desiredSize) {
      const chunkSize = Math.min(desiredSize - sendedSize, MAX_CHUNK_SIZE);
      await writer.write(new Uint8Array(chunkSize))
      sendedSize += chunkSize;
    }

    writer.close()
  }, 0);

  return new Response(readable, {
    headers: {
      'Content-Disposition': 'attachment; filename="file.bin"'
    }
  })
}

function getDesiredSize(pathname: string) {
  return Number(pathname.slice(1));
}
