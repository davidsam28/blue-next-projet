import { Instagram, Facebook, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialLinksProps {
  instagramHandle?: string
  facebookUrl?: string
  email?: string
  className?: string
  size?: 'sm' | 'md'
}

export function SocialLinks({
  instagramHandle,
  facebookUrl,
  email,
  className,
  size = 'md',
}: SocialLinksProps) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {instagramHandle && (
        <a
          href={`https://instagram.com/${instagramHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className={cn(
            btnSize,
            'rounded-full bg-[#E6EBFF] flex items-center justify-center text-[#0033FF] hover:bg-[#0033FF] hover:text-white transition-colors'
          )}
        >
          <Instagram className={iconSize} />
        </a>
      )}
      {facebookUrl && (
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className={cn(
            btnSize,
            'rounded-full bg-[#E6EBFF] flex items-center justify-center text-[#0033FF] hover:bg-[#0033FF] hover:text-white transition-colors'
          )}
        >
          <Facebook className={iconSize} />
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          aria-label="Email"
          className={cn(
            btnSize,
            'rounded-full bg-[#E6EBFF] flex items-center justify-center text-[#0033FF] hover:bg-[#0033FF] hover:text-white transition-colors'
          )}
        >
          <Mail className={iconSize} />
        </a>
      )}
    </div>
  )
}
