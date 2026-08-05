/**
 * MoodGrid — 心情歌单一 3D 螺旋轮播
 *
 * 屏幕正中央一个固定的发光球体（当前播放指示器），12/6/N 张专辑封面
 * 以 rotateY + translateZ 分布在半径为 R 的 3D 螺旋轨道上，围绕中心球体旋转。
 *
 * 交互：
 * - 拖拽旋转：鼠标 / 触控水平拖拽控制整个螺旋容器的 rotateY。
 * - 惯性效果：松手后速度按 速度 *= 0.95（阻尼系数）逐帧衰减，直到静止；
 *   速度越快滑行越远。公式：下一帧角度 = 当前角度 + 速度；速度 = 速度 * 0.95。
 * - 悬停：单张卡片单独向屏幕前方移动（z +60）并增加高光边框。
 * - 点击 / 回车：打开对应心情歌单（onOpenMood）。
 *
 * 封面数量基于数据动态渲染（moodPlaylists.length），新增专辑时自动增加，
 * 效果连续循环（环形轨道 + 闲置微旋）。
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import type { MoodPlaylist } from '../types';
import { artworkSrc } from '../utils';
import { playlistCover } from '../data/musicData';

export interface MoodGridProps {
  moodPlaylists: MoodPlaylist[];
  onOpenMood: (id: number) => void;
}

const DAMPING = 0.95; // 惯性阻尼系数：速度 *= 0.95
const DRAG_SENSITIVITY = 0.32; // 拖拽灵敏度（px → deg）
const AUTO_SPIN = 0.03; // 闲置自动微旋，保持“连续循环”观感
const HOVER_PUSH = 60; // 悬停时向前的位移（z）
const MIN_DRAG_PX = 6; // 位移小于此值视为点击

export function MoodGrid({ moodPlaylists, onOpenMood }: MoodGridProps) {
  const N = Math.max(moodPlaylists.length, 1);
  const ringRef = useRef<HTMLDivElement>(null);
  const rotation = useRef(0); // 当前角度
  const velocity = useRef(0); // 角速度（deg/帧）
  const rafRef = useRef<number | null>(null);
  const drag = useRef({
    active: false,
    startX: 0,
    startRot: 0,
    lastX: 0,
    moved: 0,
  });
  const downIndex = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const curRef = useRef(-1);

  const [hovered, setHovered] = useState<number | null>(null);
  const [cur, setCur] = useState(0);
  const [radius, setRadius] = useState(400);
  const [cardSize, setCardSize] = useState(200);

  // 响应式：轨道半径与卡片尺寸随视口缩放
  useEffect(() => {
    const apply = () => {
      const w = window.innerWidth;
      if (w < 560) {
        setRadius(230);
        setCardSize(150);
      } else if (w < 900) {
        setRadius(320);
        setCardSize(180);
      } else {
        setRadius(400);
        setCardSize(200);
      }
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  // 惯性 + 自动旋转循环
  useEffect(() => {
    const tick = () => {
      if (!drag.current.active) {
        if (Math.abs(velocity.current) > 0.02) {
          // 核心惯性公式：下一帧角度 = 当前角度 + 速度；速度 = 速度 * 0.95
          rotation.current += velocity.current;
          velocity.current *= DAMPING;
        } else {
          // 速度衰减殆尽后保持极慢连续旋转
          rotation.current += AUTO_SPIN;
        }
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translateZ(${-radius}px) rotateY(${rotation.current}deg)`;
      }
      // 计算当前正对前方的卡片索引（用于中心球体指示）
      const step = 360 / N;
      const idx = (((Math.round(-rotation.current / step) % N) + N) % N);
      if (idx !== curRef.current) {
        curRef.current = idx;
        setCur(idx);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [N, radius]);

  // 拖拽开始
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    drag.current.active = true;
    drag.current.startX = e.clientX;
    drag.current.lastX = e.clientX;
    drag.current.startRot = rotation.current;
    drag.current.moved = 0;
    velocity.current = 0;
    const el = (e.target as HTMLElement).closest('[data-index]');
    downIndex.current = el ? Number(el.getAttribute('data-index')) : null;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  // 拖拽中：实时更新角度 + 估算角速度
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    rotation.current = drag.current.startRot + dx * DRAG_SENSITIVITY;
    // 角速度 ≈ 本帧位移（deg）
    velocity.current = (e.clientX - drag.current.lastX) * DRAG_SENSITIVITY;
    drag.current.lastX = e.clientX;
  }, []);

  // 拖拽结束：位移很小 → 视为点击打开；否则保留速度进入惯性滑行
  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current.active) return;
      drag.current.active = false;
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      if (drag.current.moved < MIN_DRAG_PX) {
        velocity.current = 0;
        if (downIndex.current != null) {
          suppressClick.current = true;
          onOpenMood(moodPlaylists[downIndex.current]!.id);
        }
      }
      downIndex.current = null;
    },
    [moodPlaylists, onOpenMood],
  );

  // 卡片点击（键盘可达性：Enter / 空格触发，pointer 点击由 endDrag 处理避免重复）
  const cardClick = useCallback(
    (i: number) => {
      if (suppressClick.current) {
        suppressClick.current = false;
        return;
      }
      onOpenMood(moodPlaylists[i]!.id);
    },
    [moodPlaylists, onOpenMood],
  );

  const activeTitle = moodPlaylists[cur]?.title ?? '';

  return (
    <section
      className="section"
      id="mood"
      style={{ padding: '80px 0', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <h2
          className="section-title"
          style={{
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '-1px',
            marginBottom: '8px',
          }}
        >
          心情歌单
        </h2>
        <p
          className="section-desc"
          style={{ color: 'var(--gray-500)', fontSize: '15px', marginBottom: '8px' }}
        >
          拖拽旋转 · 点击封面播放对应心情
        </p>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          position: 'relative',
          height: `${cardSize * 2 + 200}px`,
          perspective: '1500px',
          touchAction: 'none',
          cursor: 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* 中心光球：视觉上隐藏，但保留当前选中的指示文案 */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 150,
            height: 150,
            marginLeft: -75,
            marginTop: -75,
            borderRadius: '50%',
            zIndex: 5,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 光球视觉元素：完全透明，仅保留布局占位 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'transparent',
              boxShadow: 'none',
              opacity: 0,
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: -28,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--gray-500)',
              whiteSpace: 'nowrap',
            }}
          >
            {activeTitle}
          </span>
        </div>

        {/* 3D 螺旋旋转环 */}
        <div
          ref={ringRef}
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
          }}
        >
          {moodPlaylists.map((p, i) => {
            const angle = (i / N) * 360;
            // 螺旋竖向起伏，营造 3D 螺旋轨道观感（连续循环仍为环形）
            const helix = Math.sin((i / N) * Math.PI * 2) * 26;
            const isHover = hovered === i;
            return (
              <button
                key={p.id}
                data-index={i}
                className="mood-3d-card"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered((h) => (h === i ? null : h))}
                onClick={() => cardClick(i)}
                aria-label={`${p.title} — ${p.tag}`}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: cardSize,
                  height: cardSize,
                  marginLeft: -cardSize / 2,
                  marginTop: -cardSize / 2,
                  borderRadius: 20,
                  border: isHover
                    ? '1.5px solid rgba(255,255,255,0.92)'
                    : '1px solid rgba(255,255,255,0.18)',
                  boxShadow: isHover
                    ? '0 0 44px rgba(45,212,191,0.6)'
                    : '0 12px 32px rgba(0,0,0,0.38)',
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${angle}deg) translateZ(${radius + (isHover ? HOVER_PUSH : 0)}px) translateY(${helix}px)`,
                  transition:
                    'transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .3s, border-color .3s',
                  background: p.cover,
                  cursor: 'pointer',
                  padding: 0,
                  overflow: 'hidden',
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(2px)',
                }}
              >
                <img
                  src={artworkSrc(playlistCover(p)) || ''}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  onError={(ev) => {
                    (ev.currentTarget as HTMLImageElement).style.opacity = '0';
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    pointerEvents: 'none',
                  }}
                />
                {/* 底部信息条：标题 + 心情标签 */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '10px 12px',
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.72), transparent)',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#fff',
                      textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {p.title}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#fff',
                      background: 'rgba(255,255,255,0.22)',
                      borderRadius: 999,
                      padding: '2px 8px',
                    }}
                  >
                    {p.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .mood-3d-card:focus-visible {
          outline: 2px solid var(--teal);
          outline-offset: 3px;
        }
      `}</style>
    </section>
  );
}
