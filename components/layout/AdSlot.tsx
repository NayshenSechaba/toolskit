interface AdSlotProps {
  size?: 'banner' | 'sidebar' | 'rectangle'
  label?: string
}

export default function AdSlot({ size = 'banner', label = 'Advertisement' }: AdSlotProps) {
  return null
}
