// Editable ads theme. Look-only — shape is locked in src/lib/ad-slots.ts.
// Tuned to the editorial reference: sharp corners, hairline border, no shadow.

import type { AdSkin } from '@/lib/ads/ad-frame'

export const adSkin: AdSkin = {
  radius: '0px',
  border: '1px solid rgba(19,17,22,0.12)',
  shadow: 'none',
  background: '#faf4eb',
  labelClassName: 'bg-[#f56815] text-[#faf4eb]',
}

export const adSkinBySlot: Partial<Record<string, AdSkin>> = {
  sidebar: { radius: '0px', border: '1px solid rgba(19,17,22,0.12)', shadow: 'none' },
  popup: { radius: '3px' },
  header: { radius: '0px', background: '#faf4eb' },
  rail: { radius: '0px' },
  feature: { radius: '0px' },
  'in-feed': { radius: '0px', background: '#f2ecdf', border: '1px solid rgba(19,17,22,0.20)' },
  footer: { radius: '0px', background: '#faf4eb' },
  interstitial: { radius: '3px', shadow: '0 20px 60px rgba(19,17,22,0.55)' },
  anchor: { radius: '0px', shadow: '0 6px 24px rgba(19,17,22,0.22)' },
}

export function skinFor(slot: string): AdSkin {
  return { ...adSkin, ...(adSkinBySlot[slot] ?? {}) }
}
