export function Logo({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <div 
      className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size * 0.6}
        height={size * 0.6}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 25 L40 55 L50 35 L60 55 L70 25"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25 60 Q50 85 75 60"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="50" cy="72" r="3" fill="white" />
      </svg>
    </div>
  )
}
