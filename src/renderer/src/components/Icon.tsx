import {
  ArrowLeft, ArrowRight, Check, ChevronDown, Folder, Home, Menu, MoreHorizontal,
  PanelLeftClose, PanelLeftOpen, Plus, Search, Settings2, X,
  type LucideIcon
} from 'lucide-react'

type IconName = 'menu' | 'settings' | 'search' | 'home' | 'plus' | 'folder' | 'close' | 'arrow' | 'back' | 'more' | 'panelOpen' | 'panelClose' | 'chevronDown' | 'check'

const icons: Record<IconName, LucideIcon> = {
  menu: Menu, settings: Settings2, search: Search, home: Home, plus: Plus, folder: Folder,
  close: X, arrow: ArrowRight, back: ArrowLeft, more: MoreHorizontal,
  panelOpen: PanelLeftOpen, panelClose: PanelLeftClose, chevronDown: ChevronDown, check: Check
}

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const Component = icons[name]
  return <Component aria-hidden="true" width={size} height={size} strokeWidth={1.8} />
}
