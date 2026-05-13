import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const artifactsDir = path.join(rootDir, 'output', 'smoke')
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-game-smoke-'))
const debugPort = Number(process.env.AI_GAME_SMOKE_PORT || 9333)
const baseUrl = `http://127.0.0.1:${debugPort}`
const electronBin = process.platform === 'win32'
  ? path.join(rootDir, 'node_modules', 'electron', 'dist', 'electron.exe')
  : path.join(rootDir, 'node_modules', '.bin', 'electron')

let electronProcess
let socket
let messageId = 0
const pending = new Map()

try {
  fs.mkdirSync(artifactsDir, { recursive: true })
  electronProcess = spawn(electronBin, [
    '.',
    `--remote-debugging-port=${debugPort}`
  ], {
    cwd: rootDir,
    env: {
      ...process.env,
      AI_GAME_USER_DATA_DIR: userDataDir,
      AI_GAME_DISABLE_MYSQL: '1',
      AI_PROXY_URL: '',
      ELECTRON_ENABLE_LOGGING: '1'
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  })

  electronProcess.stdout.on('data', chunk => process.stdout.write(chunk))
  electronProcess.stderr.on('data', chunk => process.stderr.write(chunk))
  electronProcess.on('exit', code => {
    if (code !== 0 && code !== null) {
      console.error(`Electron exited with code ${code}`)
    }
  })

  const page = await waitForPage()
  socket = await connectWebSocket(page.webSocketDebuggerUrl)
  socket.addEventListener('message', handleSocketMessage)

  await cdp('Runtime.enable')
  await cdp('Page.enable')

  await evaluate(() => {
    window.localStorage.setItem('aiGameFastReveal', '1')
  })

  await waitForTestId('setup-screen', 10000)
  await typeByTestId('guest-name-input', '验收玩家')
  await waitForValueByTestId('guest-name-input', '验收玩家', 3000)
  await clickByTestId('guest-start-button')
  await waitForTestId('main-menu', 10000)

  await clickByTestId('new-game-button')
  await waitForTextByTestId('current-node-title', '入学报到', 10000)
  await waitForTestId('choice-c1_enthusiastic', 10000)
  await clickByTestId('choice-c1_enthusiastic')
  await waitForTextByTestId('current-node-title', '宿舍分配', 15000)
  await waitForTextByTestId('current-location', '宿舍楼', 15000)

  await clickByTestId('status-button')
  await waitForTestId('status-panel', 5000)
  await clickByTestId('home-button')
  await waitForTestId('main-menu', 10000)

  await clickByTestId('menu-tab-存档')
  await clickByTestId('manual-save-button')
  await waitForTestId('notice-success', 10000)
  await clickByTestId('autosave-load-button')
  await waitForTextByTestId('current-node-title', '宿舍分配', 10000)

  await screenshot('success.png')
  console.log('E2E smoke passed.')
} catch (error) {
  console.error('E2E smoke failed.')
  console.error(error instanceof Error ? error.stack ?? error.message : error)
  try {
    await screenshot('failure.png')
  } catch {
  }
  process.exitCode = 1
} finally {
  if (socket) {
    socket.close()
  }
  if (electronProcess && !electronProcess.killed) {
    electronProcess.kill()
  }
  await delay(500)
  fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}

async function waitForPage() {
  const deadline = Date.now() + 20000
  let lastError

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/json/list`)
      const pages = await response.json()
      const page = pages.find(item => item.type === 'page' && item.webSocketDebuggerUrl)
      if (page) {
        return page
      }
    } catch (error) {
      lastError = error
    }
    await delay(250)
  }

  throw new Error(`DevTools page not available: ${lastError instanceof Error ? lastError.message : 'timeout'}`)
}

async function connectWebSocket(url) {
  const ws = new WebSocket(url)
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('WebSocket connection timed out')), 10000)
    ws.addEventListener('open', () => {
      clearTimeout(timer)
      resolve()
    }, { once: true })
    ws.addEventListener('error', () => {
      clearTimeout(timer)
      reject(new Error('WebSocket connection failed'))
    }, { once: true })
  })
  return ws
}

function handleSocketMessage(event) {
  const message = JSON.parse(String(event.data))
  if (!message.id) {
    return
  }

  const callbacks = pending.get(message.id)
  if (!callbacks) {
    return
  }

  pending.delete(message.id)
  if (message.error) {
    callbacks.reject(new Error(message.error.message || 'CDP command failed'))
  } else {
    callbacks.resolve(message.result)
  }
}

function cdp(method, params = {}) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error('CDP socket is not open')
  }

  const id = ++messageId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error(`CDP command timed out: ${method}`))
    }, 15000)

    pending.set(id, {
      resolve: value => {
        clearTimeout(timer)
        resolve(value)
      },
      reject: error => {
        clearTimeout(timer)
        reject(error)
      }
    })
  })
}

async function evaluate(pageFunction, ...args) {
  const expression = `(${pageFunction.toString()})(...${JSON.stringify(args)})`
  const result = await cdp('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  })

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Evaluation failed')
  }

  return result.result?.value
}

async function waitForTestId(testId, timeoutMs) {
  const found = await waitFor(() => evaluate(id => Boolean(document.querySelector(`[data-testid="${id}"]`)), testId), timeoutMs)
  if (!found) {
    throw new Error(`Timed out waiting for [data-testid="${testId}"]`)
  }
}

async function waitForTextByTestId(testId, expectedText, timeoutMs) {
  const found = await waitFor(async () => {
    const text = await evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.textContent ?? '', testId)
    return text.includes(expectedText)
  }, timeoutMs)

  if (!found) {
    throw new Error(`Timed out waiting for text "${expectedText}" in [data-testid="${testId}"]`)
  }
}

async function waitForValueByTestId(testId, expectedValue, timeoutMs) {
  const found = await waitFor(async () => {
    const value = await evaluate(id => {
      const el = document.querySelector(`[data-testid="${id}"]`)
      return el instanceof HTMLInputElement ? el.value : ''
    }, testId)
    return value === expectedValue
  }, timeoutMs)

  if (!found) {
    throw new Error(`Timed out waiting for value "${expectedValue}" in [data-testid="${testId}"]`)
  }
}

async function clickByTestId(testId) {
  const clicked = await evaluate(id => {
    const el = document.querySelector(`[data-testid="${id}"]`)
    if (!(el instanceof HTMLElement)) {
      return false
    }
    el.click()
    return true
  }, testId)

  if (!clicked) {
    throw new Error(`Element not found or not clickable: ${testId}`)
  }
}

async function typeByTestId(testId, value) {
  const typed = await evaluate((id, nextValue) => {
    const el = document.querySelector(`[data-testid="${id}"]`)
    if (!(el instanceof HTMLInputElement)) {
      return false
    }
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    el.focus()
    setter?.call(el, nextValue)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, testId, value)

  if (!typed) {
    throw new Error(`Input not found: ${testId}`)
  }
}

async function waitFor(predicate, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await predicate()) {
      return true
    }
    await delay(120)
  }
  return false
}

async function screenshot(fileName) {
  const result = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
  fs.writeFileSync(path.join(artifactsDir, fileName), Buffer.from(result.data, 'base64'))
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
