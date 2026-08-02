export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  colorRgb: string;
  url: string;
  repo: string;
  tech: string[];
  features: string[];
  status: 'live' | 'beta';
}

export const projects: Project[] = [
  {
    id: 'wave',
    name: 'Jack Wave',
    tagline: 'Music Journal',
    description: '用音乐记录生活，用旋律收藏时光。月度精选歌单、心情歌单、Apple Music 个人精选集，让每一段旋律都成为生活的注脚。',
    icon: 'wave',
    color: '#06b6d4',
    colorRgb: '6, 182, 212',
    url: 'https://jack-wave.pages.dev',
    repo: 'jacktan-001/jack-wave',
    tech: ['PWA', 'Cloudflare KV', 'Pages Functions', 'Service Worker'],
    features: ['月度歌单', '心情歌单', '音乐播放器', '管理后台', '离线支持'],
    status: 'live',
  },
  {
    id: 'pose',
    name: 'Jack Pose',
    tagline: 'Photo Layout Tool',
    description: '社媒排版・长图导出工具。支持朋友圈/小红书双平台预览，拼长图、工程文件管理，让每一张照片都有完美的呈现。',
    icon: 'pose',
    color: '#ec4899',
    colorRgb: '236, 72, 153',
    url: 'https://jackpose.pages.dev',
    repo: 'jacktan-001/jack-pose',
    tech: ['React Router', 'TypeScript', 'Tailwind CSS', 'Vite'],
    features: ['排版编辑器', '双平台预览', '拼长图', '工程文件导入导出', '实时渲染'],
    status: 'live',
  },
  {
    id: 'tan',
    name: 'Jack Tan',
    tagline: 'Portfolio',
    description: '个人职业展示页。民航安全信息化领域 9+ 年经验，8 个上线系统、2 项国家发明专利、USOAP 审计零不符合项。',
    icon: 'profile',
    color: '#7c3aed',
    colorRgb: '124, 58, 237',
    url: 'https://jack-tan.pages.dev',
    repo: 'jacktan-001/jack-tan',
    tech: ['HTML5', 'CSS3', 'IntersectionObserver', 'PWA'],
    features: ['工作经历', '核心项目', '上线作品', '专利成果', '荣誉资质'],
    status: 'live',
  },
];

export const socialLinks = [
  { label: 'Email', href: 'mailto:jacktan2011@icloud.com', icon: 'mail' },
  { label: 'GitHub', href: 'https://github.com/jacktan-001', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jacktan2011', icon: 'linkedin' },
  { label: 'Instagram', href: 'https://instagram.com/jacktan2011', icon: 'instagram' },
  { label: '小红书', href: 'https://www.xiaohongshu.com/user/profile/JackTan', icon: 'xiaohongshu' },
];
