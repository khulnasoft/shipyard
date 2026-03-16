import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(__filename)

describe('Healthcheck Service', () => {
  const healthcheckPath = path.resolve(
    __dirname,
    '../../services/healthcheck.js'
  )

  it('healthcheck script exists', () => {
    expect(fs.existsSync(healthcheckPath)).toBe(true)
  })

  it('healthcheck file has correct structure', () => {
    const content = fs.readFileSync(healthcheckPath, 'utf8')

    expect(content).toContain('healthCheck')
    expect(content).toContain('http.request')
  })
})
