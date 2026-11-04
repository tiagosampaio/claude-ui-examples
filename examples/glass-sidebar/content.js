/**
 * Everything the sidebar says. Edit this file to re-skin the example for a
 * different video without touching the behaviour.
 */
export const CONTENT = {
  brand: { initial: 'S', name: 'Solstice', subtitle: 'Finance workspace' },
  search: { id: 'search', icon: 'search', label: 'Search pages', shortcut: '⌘K' },
  sections: [
    {
      title: 'Main',
      rows: [
        { id: 'overview', icon: 'grid', label: 'Overview' },
        { id: 'activity', icon: 'bolt', label: 'Activity', count: 12, dot: true },
        { id: 'wallet', icon: 'wallet', label: 'Wallet' },
        { id: 'calendar', icon: 'calendar', label: 'Calendar', status: true, dot: true },
      ],
    },
    {
      title: 'Workspace',
      rows: [
        { id: 'inbox', icon: 'chat', label: 'Inbox', count: 3, accent: true, dot: true },
        {
          id: 'projects',
          icon: 'layers',
          label: 'Projects',
          children: [
            { label: 'Website refresh', color: '#34d3a6' },
            { label: 'iOS launch', color: '#f6894a' },
            { label: 'Brand system', color: '#b48cf2' },
          ],
        },
        { id: 'insights', icon: 'bars', label: 'Insights' },
        { id: 'settings', icon: 'gear', label: 'Settings' },
      ],
    },
  ],
  night: { id: 'night', icon: 'sun', label: 'Night mode' },
  user: { initials: 'SR', name: 'Sam Rivera', email: 'sam@solstice.app' },
};

/** The row selected in the first frame. */
export const DEFAULT_ACTIVE_ROW = 'overview';
