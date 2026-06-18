/** 管理端图标名 → C 端展示字符（跨端兼容，不依赖 icon 字体库） */
export const iconCharMap: Record<string, string> = {
  House: '🏠',
  home: '🏠',
  Goods: '🛒',
  mall: '🛒',
  User: '👤',
  user: '👤',
  Menu: '☰',
  Setting: '⚙',
  Document: '📄',
  Folder: '📁',
  More: '⋯',
  OfficeBuilding: '🏢',
  community: '🏢',
  Calendar: '📅',
  ChatDotRound: '💬',
  Service: '🛎',
  Bell: '🔔',
  Trophy: '🏆',
  Tools: '🔧',
  ChatLineRound: '💭',
}

export function getIconChar(name?: string, fallback = '•') {
  if (!name) return fallback
  return iconCharMap[name] || fallback
}
