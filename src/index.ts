import { Hono } from 'hono'
import { stream } from 'hono/streaming'
import filesizeParser from 'filesize-parser'

const app = new Hono()

app.get('/', (c) => c.redirect('https://github.com/alsotang/cf_workers__file'))

app.get('/:size', (c) => {
  let size: number
  try {
    size = filesizeParser(c.req.param('size'))
  } catch {
    return c.text('Invalid file size', 400)
  }
  if (!Number.isFinite(size) || size < 0) {
    return c.text('Invalid file size', 400)
  }

  c.header('Content-Type', 'application/octet-stream')
  c.header('Content-Disposition', 'attachment; filename="file.bin"')
  return stream(c, async (output) => {
    const chunk = new Uint8Array(Math.min(size, 10 * 1024 * 1024))
    while (size > 0 && !output.aborted) {
      await output.write(chunk.subarray(0, Math.min(size, chunk.length)))
      size -= chunk.length
    }
  })
})

export default app
