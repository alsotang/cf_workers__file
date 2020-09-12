import filesizeParser from 'filesize-parser'

// per chunk size should not reach worker's memory limit
// https://developers.cloudflare.com/workers/platform/limits
const MAX_CHUNK_SIZE = 1024 * 1024 * 10; // 10MB

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === '/') {
    return Response.redirect('https://github.com/alsotang/cf_workers__file', 302)
  }

  const desiredSize = getDesiredSize(url.pathname);
  let sendedSize = 0;

  let { readable, writable } = new TransformStream()

  // return the readable first, then write to it
  setTimeout(async () => {
    const MAX_CHUNK = new Uint8Array(MAX_CHUNK_SIZE)
    const writer = writable.getWriter()

    // use stream to keep memory usage small enough
    while (sendedSize < desiredSize) {
      const chunkSize = Math.min(desiredSize - sendedSize, MAX_CHUNK_SIZE);
      if (chunkSize === MAX_CHUNK_SIZE) {
        await writer.write(MAX_CHUNK)
      } else {
        await writer.write(new Uint8Array(chunkSize))
      }
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
  return filesizeParser(pathname.slice(1));
}
