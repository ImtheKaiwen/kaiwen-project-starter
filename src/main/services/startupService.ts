export interface LoginItemAdapter {
  setLoginItemSettings(settings: { openAtLogin: boolean }): void
  getLoginItemSettings(): { openAtLogin: boolean }
}

export function syncStartup(packaged: boolean, desired: boolean, adapter: LoginItemAdapter): boolean {
  if (!packaged) return false
  adapter.setLoginItemSettings({ openAtLogin: desired })
  return adapter.getLoginItemSettings().openAtLogin
}

export function readStartup(packaged: boolean, adapter: LoginItemAdapter): boolean {
  return packaged && adapter.getLoginItemSettings().openAtLogin
}
