import {
  ArrowLeft, ArrowRight, Check, ChevronDown, Folder, Home, Menu, MoreHorizontal,
  Download, Languages, Moon, PanelLeftClose, PanelLeftOpen, Plus, RefreshCw, Search, Settings2, Sun, X,
  type LucideIcon
} from 'lucide-react'

type IconName = 'menu' | 'settings' | 'search' | 'home' | 'plus' | 'folder' | 'close' | 'arrow' | 'back' | 'more' | 'panelOpen' | 'panelClose' | 'chevronDown' | 'check' | 'sun' | 'moon' | 'languages' | 'download' | 'refresh'

const icons: Record<IconName, LucideIcon> = {
  menu: Menu, settings: Settings2, search: Search, home: Home, plus: Plus, folder: Folder,
  close: X, arrow: ArrowRight, back: ArrowLeft, more: MoreHorizontal,
  panelOpen: PanelLeftOpen, panelClose: PanelLeftClose, chevronDown: ChevronDown, check: Check,
  sun: Sun, moon: Moon, languages: Languages, download: Download, refresh: RefreshCw
}

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const Component = icons[name]
  return <Component aria-hidden="true" width={size} height={size} strokeWidth={1.8} />
}
