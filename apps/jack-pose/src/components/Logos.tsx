import type { SVGProps } from 'react'

/** 微信官方 icon：两大一小气泡 */
export function WeChatLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect width="24" height="24" rx="5.5" fill="#07C160" />
      <path
        d="M15.4 9.2c0-2.7-2.7-4.9-6-4.9S3.4 6.5 3.4 9.2c0 1.5.8 2.9 2.1 3.8l-.5 1.5 1.8-1c.8.3 1.7.4 2.6.4.2 0 .5 0 .7 0-.2-.5-.2-1-.2-1.5 0-2 2.1-3.6 4.7-3.6.3 0 .5 0 .8.1z"
        fill="#fff"
      />
      <circle cx="7.2" cy="8.5" r=".9" fill="#07C160" />
      <circle cx="11.2" cy="8.5" r=".9" fill="#07C160" />
      <path
        d="M20.6 13.2c0-2.1-2.1-3.8-4.6-3.8s-4.6 1.7-4.6 3.8 2.1 3.8 4.6 3.8c.5 0 1-.1 1.5-.2l1.5.8-.4-1.2c1.2-.9 2-2.2 2-3.2z"
        fill="#fff"
      />
      <circle cx="14.3" cy="12.8" r=".65" fill="#07C160" />
      <circle cx="17.7" cy="12.8" r=".65" fill="#07C160" />
    </svg>
  )
}

export function XiaohongshuLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect width="24" height="24" rx="5" fill="#FF2442" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fill="#fff"
        fontSize="7.5"
        fontWeight="800"
        fontFamily="-apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif"
      >
        小红书
      </text>
    </svg>
  )
}

/** 小熊头像（写死） */
export function AvatarBear({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      {/* 耳朵 */}
      <circle cx="8" cy="10" r="7" fill="#C4956A" />
      <circle cx="32" cy="10" r="7" fill="#C4956A" />
      <circle cx="8" cy="10" r="4" fill="#E8C9A0" />
      <circle cx="32" cy="10" r="4" fill="#E8C9A0" />
      {/* 头 */}
      <circle cx="20" cy="22" r="17" fill="#C4956A" />
      {/* 脸白 */}
      <ellipse cx="20" cy="26" rx="10" ry="8" fill="#F0DEC5" />
      {/* 眼睛 */}
      <circle cx="14" cy="19" r="2.2" fill="#333" />
      <circle cx="26" cy="19" r="2.2" fill="#333" />
      <circle cx="14.7" cy="18.3" r=".8" fill="#fff" />
      <circle cx="26.7" cy="18.3" r=".8" fill="#fff" />
      {/* 鼻子 + 嘴 */}
      <ellipse cx="20" cy="24" rx="3" ry="2.2" fill="#8B6544" />
      <path d="M20 26.2 Q17 29 14.5 27.5" stroke="#333" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M20 26.2 Q23 29 25.5 27.5" stroke="#333" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}