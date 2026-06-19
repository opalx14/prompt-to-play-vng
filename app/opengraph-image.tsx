import { ImageResponse } from 'next/og'

export const alt = 'Echo Relay — deterministic isometric Echo puzzle game'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          color: '#f4f0df',
          background: 'linear-gradient(145deg, #15172c 0%, #090b18 72%)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 34,
            display: 'flex',
            border: '2px solid #3c456f',
            borderRadius: 30,
          }}
        />

        <div
          style={{
            width: '58%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 0 80px 82px',
          }}
        >
          <div
            style={{
              display: 'flex',
              color: '#71e2bd',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 6,
              textTransform: 'uppercase',
            }}
          >
            Prompt To Play · Portfolio
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 18,
              fontSize: 92,
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: -3,
              textTransform: 'uppercase',
            }}
          >
            Echo Relay
          </div>
          <div
            style={{
              display: 'flex',
              width: 570,
              marginTop: 30,
              color: '#a9afc9',
              fontSize: 28,
              lineHeight: 1.4,
            }}
          >
            Record your path. Create an Echo. Solve the room together.
          </div>
        </div>

        <div
          style={{
            width: '42%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 330,
              height: 330,
              display: 'flex',
              position: 'relative',
              transform: 'rotate(30deg) skewY(-8deg)',
              border: '3px solid #596493',
              background: 'linear-gradient(135deg, #303758, #1f2542)',
              boxShadow: '0 35px 80px rgba(0,0,0,0.45)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 76,
                top: 170,
                width: 58,
                height: 58,
                display: 'flex',
                borderRadius: 12,
                background: '#f3c969',
                boxShadow: '0 0 30px rgba(243,201,105,0.45)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 190,
                top: 90,
                width: 58,
                height: 58,
                display: 'flex',
                borderRadius: 12,
                opacity: 0.72,
                background: '#6ce3ea',
                boxShadow: '0 0 34px rgba(108,227,234,0.5)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 224,
                top: 225,
                width: 64,
                height: 64,
                display: 'flex',
                borderRadius: 999,
                border: '5px solid #fff0a8',
                boxShadow: '0 0 36px rgba(243,201,105,0.55)',
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  )
}
