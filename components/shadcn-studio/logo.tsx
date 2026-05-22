import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/placecom_logo.png"
        alt="PlaceCom Logo"
        className="h-8 object-contain"
      />
      <span className='text-xl font-semibold'>Connect Placecom</span>
    </div>
  )
}

export default Logo
