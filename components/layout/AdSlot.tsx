interface AdSlotProps {
  size?: 'banner' | 'sidebar' | 'rectangle'
  label?: string
}

export default function AdSlot({ size = 'banner', label = 'Advertisement' }: AdSlotProps) {
  return (
    <div
      className={`ad-slot ${size === 'banner' ? 'ad-slot-banner' : 'ad-slot-sidebar'}`}
      style={size === 'rectangle' ? { width: '100%', height: '250px' } : undefined}
      aria-label={label}
    >
      <span style={{ fontSize: '1.25rem' }}>📢</span>
      <span>{label}</span>
      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>AdSense slot — activate after approval</span>
    </div>
  )
}
