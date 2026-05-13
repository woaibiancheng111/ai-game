import { spawn } from 'node:child_process'
import process from 'node:process'

const checks = [
  ['typecheck', 'npm run typecheck'],
  ['validate:story', 'npm run validate:story'],
  ['route:smoke', 'npm run route:smoke'],
  ['test:e2e:smoke', 'npm run test:e2e:smoke']
]

for (const [label, command] of checks) {
  console.log(`\n[release:verify] ${label}`)
  const result = await run(command)
  if (result !== 0) {
    console.error(`[release:verify] ${label} failed with exit code ${result}`)
    process.exit(result || 1)
  }
}

console.log('\n[release:verify] all checks passed.')

function run(command) {
  return new Promise(resolve => {
    const child = spawn(resolveShellCommand(command), resolveShellArgs(command), {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
      windowsHide: true
    })

    child.on('error', error => {
      console.error(error)
      resolve(1)
    })
    child.on('exit', code => resolve(code ?? 1))
  })
}

function resolveShellCommand() {
  if (process.platform === 'win32') {
    return 'cmd.exe'
  }
  return 'sh'
}

function resolveShellArgs(command) {
  if (process.platform === 'win32') {
    return ['/d', '/s', '/c', command]
  }
  return ['-lc', command]
}
