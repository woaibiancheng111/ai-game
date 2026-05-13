import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const releaseDir = path.join(rootDir, 'release')
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'))
const generatedAt = new Date().toISOString()

if (!fs.existsSync(releaseDir)) {
  console.error('Release directory does not exist. Run npm run dist:win first.')
  process.exit(1)
}

const artifacts = fs.readdirSync(releaseDir)
  .filter(file => /\.(exe|blockmap|yml|yaml)$/i.test(file))
  .map(file => {
    const fullPath = path.join(releaseDir, file)
    const stats = fs.statSync(fullPath)
    return {
      file,
      bytes: stats.size,
      sha256: sha256File(fullPath),
      lastModified: stats.mtime.toISOString(),
      signed: isSignedWindowsArtifact(file)
    }
  })
  .sort((a, b) => a.file.localeCompare(b.file))

const installer = artifacts.find(artifact => /\.exe$/i.test(artifact.file))
if (!installer) {
  console.error('No Windows installer .exe found in release directory.')
  process.exit(1)
}

const manifest = {
  productName: packageJson.build?.productName ?? packageJson.name,
  appId: packageJson.build?.appId ?? '',
  version: packageJson.version,
  platform: 'windows',
  arch: 'x64',
  generatedAt,
  signing: {
    expectedForPublicRelease: true,
    currentPackageConfig: packageJson.build?.win?.sign === false ? 'unsigned' : 'signed-or-external',
    note: packageJson.build?.win?.sign === false
      ? 'Current package.json disables Windows signing. Public release should use a code signing certificate.'
      : 'Verify Authenticode signature before distribution.'
  },
  artifacts
}

const jsonPath = path.join(releaseDir, 'release-manifest.json')
const markdownPath = path.join(releaseDir, 'release-manifest.md')
fs.writeFileSync(jsonPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
fs.writeFileSync(markdownPath, toMarkdown(manifest), 'utf8')

console.log(`Release manifest written: ${jsonPath}`)
console.log(`Release manifest written: ${markdownPath}`)
console.log(`Installer: ${installer.file}`)
console.log(`SHA256: ${installer.sha256}`)
if (packageJson.build?.win?.sign === false) {
  console.warn('Warning: Windows signing is disabled in package.json. Do not treat this as a public signed release.')
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256')
  hash.update(fs.readFileSync(filePath))
  return hash.digest('hex')
}

function isSignedWindowsArtifact(fileName) {
  if (!/\.exe$/i.test(fileName)) {
    return null
  }

  return packageJson.build?.win?.sign === false ? false : 'verify-with-signtool'
}

function toMarkdown(manifestData) {
  const rows = manifestData.artifacts
    .map(artifact => `| ${artifact.file} | ${artifact.bytes} | ${artifact.sha256} | ${artifact.signed ?? ''} |`)
    .join('\n')

  return `# Release Manifest

- Product: ${manifestData.productName}
- App ID: ${manifestData.appId}
- Version: ${manifestData.version}
- Platform: ${manifestData.platform} ${manifestData.arch}
- Generated At: ${manifestData.generatedAt}
- Signing: ${manifestData.signing.currentPackageConfig}

${manifestData.signing.note}

| File | Bytes | SHA256 | Signed |
| --- | ---: | --- | --- |
${rows}
`
}
