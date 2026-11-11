// Installs or removes the built extension using the Spicetify CLI.
//   node scripts/spicetify.mjs install
//   node scripts/spicetify.mjs uninstall
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const EXTENSION = 'float.js'
const action = process.argv[2]
const built = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', EXTENSION)

/** Runs a Spicetify CLI command, showing its output. */
function spicetify(args) {
  execSync(`spicetify ${args}`, { stdio: 'inherit' })
}

let extensionsDir
try {
  const userData = execSync('spicetify path userdata', { encoding: 'utf8' }).trim()
  extensionsDir = join(userData, 'Extensions')
} catch {
  console.error('Spicetify CLI not found. Install it first: https://spicetify.app/docs/getting-started')
  process.exit(1)
}
const target = join(extensionsDir, EXTENSION)

if (action === 'install') {
  if (!existsSync(built)) {
    console.error(`Missing ${built}. Run "pnpm build" first.`)
    process.exit(1)
  }
  mkdirSync(extensionsDir, { recursive: true })
  copyFileSync(built, target)
  spicetify(`config extensions ${EXTENSION}`)
  spicetify('apply')
  console.log(`\nInstalled ${target}`)
} else if (action === 'uninstall') {
  // A trailing "-" removes the entry from Spicetify's extension list.
  spicetify(`config extensions ${EXTENSION}-`)
  rmSync(target, { force: true })
  spicetify('apply')
  console.log(`\nRemoved ${target}`)
} else {
  console.error('Usage: node scripts/spicetify.mjs <install|uninstall>')
  process.exit(1)
}
