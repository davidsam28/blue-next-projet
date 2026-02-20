import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Blue Next Project — Chicago Youth Media Arts & Audio Production'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: 'linear-gradient(135deg, #000814 0%, #001233 40%, #0033FF 100%)',
          padding: '80px',
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: 80,
            height: 6,
            backgroundColor: '#0033FF',
            borderRadius: 3,
            marginBottom: 32,
          }}
        />
        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          Blue Next Project
        </div>
        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.4,
            maxWidth: 700,
          }}
        >
          Chicago Youth Media Arts &amp; Audio Production
        </div>
        {/* Bottom info */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.15em',
            }}
          >
            501(c)(3) Nonprofit &bull; Clear Ear Studios &bull; Chicago, IL
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
