/**
 * CharSplit — 逐字分割入场动画组件
 *
 * 将文本拆分为单个字符 span，配合 CSS .studio-char-split 实现逐字显现。
 * 入场动画：字符逐一从下方翻转 + 模糊 → 清晰
 *
 * 用法：<CharSplit text="Jack Tan Studio" />
 */

import { useMemo } from 'react'

export interface CharSplitProps {
  text: string
  className?: string
}

export default function CharSplit({ text, className = '' }: CharSplitProps) {
  const chars = useMemo(() => Array.from(text), [text])

  return (
    <span className={`studio-char-split ${className}`} aria-label={text}>
      {chars.map((char, i) => (
        <span key={i} className="char" aria-hidden="true">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}
