import { spawn } from 'node:child_process'

export interface CommandResult { code: number; stdout: string; stderr: string }
export interface CommandRunner { run(command: string, args: string[], options?: { cwd?: string; timeoutMs?: number }): Promise<CommandResult> }

export class SafeCommandRunner implements CommandRunner {
  run(command: string, args: string[], options: { cwd?: string; timeoutMs?: number } = {}): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { cwd: options.cwd, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
      let stdout = ''; let stderr = ''; let settled = false
      const timer = setTimeout(() => { if (!settled) child.kill(); reject(new Error(`${command} işlemi zaman aşımına uğradı.`)) }, options.timeoutMs ?? 60_000)
      child.stdout.on('data', (chunk) => { stdout += String(chunk) })
      child.stderr.on('data', (chunk) => { stderr += String(chunk) })
      child.on('error', (error) => { settled = true; clearTimeout(timer); reject(error) })
      child.on('close', (code) => { settled = true; clearTimeout(timer); resolve({ code: code ?? -1, stdout: stdout.trim(), stderr: stderr.trim() }) })
    })
  }
}
