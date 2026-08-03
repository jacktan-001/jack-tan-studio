/**
 * Hero — Hero 区域
 * 包含头像、标题、副标题和操作按钮
 */

export interface HeroProps {
  /** 点击"播放本月歌单" */
  onPlayCurrentMonth: () => void;
}

export function Hero({ onPlayCurrentMonth }: HeroProps) {
  return (
    <section
      className="hero"
      id="home"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '100px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景渐变光斑 */}
      <div
        style={{
          content: '',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(20, 184, 166, 0.05) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <img
        className="hero-avatar"
        src={`${import.meta.env.BASE_URL}avatar.jpg`}
        alt="Jack-Wave 头像"
        loading="eager"
        style={{
          width: '140px',
          height: '140px',
          borderRadius: '28px',
          objectFit: 'cover',
          marginBottom: '32px',
          boxShadow:
            '0 12px 48px rgba(6, 182, 212, 0.15), 0 4px 16px rgba(0, 0, 0, 0.06)',
          border: 'none',
          position: 'relative',
        }}
      />
      <h1
        className="hero-title"
        style={{
          fontSize: 'clamp(40px, 8vw, 72px)',
          fontWeight: 700,
          letterSpacing: '-2px',
          lineHeight: 1.1,
          marginBottom: '12px',
          position: 'relative',
        }}
      >
        Jack-
        <span
          style={{
            background: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Wave
        </span>
      </h1>
      <p
        className="hero-subtitle"
        style={{
          fontSize: '16px',
          fontWeight: 400,
          letterSpacing: '2px',
          color: 'var(--gray-500)',
          marginBottom: '8px',
          position: 'relative',
        }}
      >
        Music Journal
      </p>
      <p
        className="hero-brand"
        style={{
          fontSize: '14px',
          fontWeight: 300,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'var(--gray-400)',
          marginBottom: '16px',
          position: 'relative',
        }}
      >
        好友乐享 · 音乐随记
      </p>
      <p
        className="hero-tagline"
        style={{
          fontSize: '15px',
          color: 'var(--gray-500)',
          marginBottom: '40px',
          maxWidth: '400px',
          position: 'relative',
        }}
      >
        用音乐记录生活，用旋律收藏时光
      </p>
      <div
        className="hero-btns"
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <a
          href="#monthly"
          className="btn-primary"
          onClick={(e) => {
            e.preventDefault();
            onPlayCurrentMonth();
          }}
          style={{
            padding: '14px 32px',
            background: 'var(--teal)',
            color: '#fff',
            borderRadius: '999px',
            fontWeight: 600,
            fontSize: '15px',
            transition: 'all .2s',
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)',
            cursor: 'pointer',
          }}
        >
          播放本月歌单
        </a>
        <a
          href="#mood"
          className="btn-outline"
          style={{
            padding: '14px 32px',
            border: '1.5px solid var(--gray-300)',
            borderRadius: '999px',
            fontWeight: 600,
            fontSize: '15px',
            color: 'var(--gray-700)',
            transition: 'all .2s',
          }}
        >
          浏览心情歌单
        </a>
      </div>
    </section>
  );
}
