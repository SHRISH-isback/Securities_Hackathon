import React from 'react'

interface Props {
  score: number  // 0-100
  size?: number
}

/**
 * SVG-based semicircular gauge that transitions from red (#ef4444) at 0
 * to green (#22c55e) at 100.
 */
export default function CredibilityGauge({ score, size = 200 }: Props) {
  const clamped = Math.max(0, Math.min(100, score))

  // Interpolate colour: red → yellow → green
  const r = clamped < 50
    ? 239
    : Math.round(239 + (34 - 239) * ((clamped - 50) / 50))
  const g = clamped < 50
    ? Math.round(68 + (197 - 68) * (clamped / 50))
    : 197
  const b = clamped < 50
    ? 68
    : Math.round(68 + (94 - 68) * ((clamped - 50) / 50))

  const color = `rgb(${r},${g},${b})`

  // Semicircle arc geometry
  const cx = size / 2
  const cy = size * 0.55
  const radius = size * 0.38
  const strokeWidth = size * 0.08

  const toXY = (angle: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy - radius * Math.sin(angle),
  })

  const startAngle = Math.PI  // 180° (left)
  const endAngle   = 0        // 0°   (right)
  const totalAngle = Math.PI  // 180° sweep

  const arcStart = toXY(startAngle)
  const arcEnd   = toXY(endAngle)

  // Background arc path (full semicircle)
  const bgPath = `M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 0 1 ${arcEnd.x} ${arcEnd.y}`

  // Filled arc
  const fillAngle = startAngle - totalAngle * (clamped / 100)
  const fillEnd   = toXY(fillAngle)
  const largeArc  = clamped > 50 ? 1 : 0
  const fgPath = `M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`

  // Needle
  const needleLen = radius - strokeWidth / 2
  const needleTip = {
    x: cx + needleLen * Math.cos(fillAngle),
    y: cy - needleLen * Math.sin(fillAngle),
  }

  const label = clamped >= 75 ? 'High Credibility' : clamped >= 50 ? 'Medium Credibility' : 'Low Credibility'

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size * 0.62}
        viewBox={`0 0 ${size} ${size * 0.62}`}
        aria-label={`Credibility score: ${clamped}`}
      >
        {/* Track */}
        <path
          d={bgPath}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        {clamped > 0 && (
          <path
            d={fgPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needleTip.x} y2={needleTip.y}
          stroke={color}
          strokeWidth={strokeWidth * 0.25}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={strokeWidth * 0.35} fill={color} />
        {/* Score */}
        <text
          x={cx} y={cy * 0.8}
          textAnchor="middle"
          fill="white"
          fontSize={size * 0.18}
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {clamped}
        </text>
        {/* Min / Max labels */}
        <text x={arcStart.x} y={cy + strokeWidth * 1.1} fill="rgba(255,255,255,0.35)" fontSize={size * 0.065} textAnchor="middle">0</text>
        <text x={arcEnd.x}   y={cy + strokeWidth * 1.1} fill="rgba(255,255,255,0.35)" fontSize={size * 0.065} textAnchor="middle">100</text>
      </svg>
      <p className="mt-1 text-sm font-semibold" style={{ color }}>{label}</p>
    </div>
  )
}
