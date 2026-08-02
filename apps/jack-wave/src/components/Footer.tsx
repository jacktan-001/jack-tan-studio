/**
 * Footer — 页脚组件
 * 包含品牌信息和管理员链接
 */

export function Footer() {
  return (
    <footer
      className="footer"
      style={{
        textAlign: 'center',
        padding: '60px 24px 140px',
        color: 'var(--gray-400)',
        fontSize: '13px',
      }}
    >
      <div
        className="footer-logo"
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--gray-700)',
          marginBottom: '8px',
        }}
      >
        Jack-<span style={{ color: 'var(--teal)' }}>Wave</span>
      </div>
      <p>Music Journal &middot; 好友乐享 · 音乐随记</p>
      <p>&copy; 2026 &middot; Made with &hearts; and music</p>
      <a
        href="/admin.html"
        className="footer-admin"
        aria-label="管理员登录"
        style={{
          display: 'inline-block',
          marginTop: '16px',
          fontSize: '11px',
          color: 'var(--gray-400)',
          opacity: 0.4,
          transition: 'opacity .2s',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.color = 'var(--teal)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.4';
          e.currentTarget.style.color = 'var(--gray-400)';
        }}
      >
        Admin
      </a>
    </footer>
  );
}
