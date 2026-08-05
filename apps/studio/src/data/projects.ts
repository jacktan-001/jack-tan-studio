export interface Project {
  id: string;
  name: string;
  tagline: string;
  /** 功能定位（一句话说明项目是做什么的） */
  positioning?: string;
  description: string;
  icon: string;
  color: string;
  colorRgb: string;
  url: string;
  repo: string;
  tech: string[];
  features: string[];
  status: 'live' | 'beta' | 'coming-soon';
}

export const projects: Project[] = [
  {
    id: 'wave',
    name: 'Jack Wave',
    tagline: 'Music Journal',
    positioning: '个人音乐随记与歌单平台',
    description: '用音乐记录生活，用旋律收藏时光。月度精选歌单、心情歌单、Apple Music 个人精选集，让每一段旋律都成为生活的注脚。',
    icon: 'wave',
    color: '#06b6d4',
    colorRgb: '6, 182, 212',
    url: '/projects/jack-wave/',
    repo: 'jacktan-001/jack-wave',
    tech: ['PWA', 'Cloudflare KV', 'Pages Functions', 'Service Worker'],
    features: ['月度歌单', '心情歌单', '音乐播放器', '管理后台', '离线支持'],
    status: 'live',
  },
  {
    id: 'pose',
    name: 'Jack Pose',
    tagline: 'Photo Layout Tool',
    positioning: '社媒长图排版与导出工具',
    description: '社媒排版・长图导出工具。支持朋友圈/小红书双平台预览，拼长图、工程文件管理，让每一张照片都有完美的呈现。',
    icon: 'pose',
    color: '#ec4899',
    colorRgb: '236, 72, 153',
    url: '/projects/jack-pose/',
    repo: 'jacktan-001/jack-pose',
    tech: ['React Router', 'TypeScript', 'Tailwind CSS', 'Vite'],
    features: ['排版编辑器', '双平台预览', '拼长图', '工程文件导入导出', '实时渲染'],
    status: 'live',
  },
  {
    id: 'tan',
    name: 'Jack Tan',
    tagline: 'Portfolio',
    positioning: '个人职业作品集',
    description: '个人职业展示页。民航安全信息化领域 9+ 年经验，8 个上线系统、2 项国家发明专利、USOAP 审计零不符合项。',
    icon: 'profile',
    color: '#7c3aed',
    colorRgb: '124, 58, 237',
    url: '/projects/jack-tan/',
    repo: 'jacktan-001/jack-tan',
    tech: ['HTML5', 'CSS3', 'IntersectionObserver', 'PWA'],
    features: ['工作经历', '核心项目', '上线作品', '专利成果', '荣誉资质'],
    status: 'live',
  },
  {
    id: 'cast',
    name: 'Jack Cast',
    tagline: 'Audio Stories',
    positioning: '个人播客与音频内容平台',
    description: '把灵感录成声音。Jack Cast 面向个人创作者，打通录制、剪辑、发布与订阅全流程，让每一段声音都被收藏与分享。',
    icon: 'cast',
    color: '#f59e0b',
    colorRgb: '245, 158, 11',
    url: '/projects/cast',
    repo: '',
    tech: ['Web Audio API', 'MediaRecorder', 'R2 Storage', 'Podcast RSS'],
    features: ['一键录音与波形可视化', '在线剪辑与多轨合成', '自动生成 Podcast RSS 订阅源', '云端存储与全球分发'],
    status: 'coming-soon',
  },
  {
    id: 'craft',
    name: 'Jack Craft',
    tagline: 'Creative Sandbox',
    positioning: '生成式艺术与交互创意实验场',
    description: '代码即画笔。Jack Craft 探索技术与美学的交汇点，汇集生成式艺术、着色器实验与交互装置，让每一个脑洞都能实时呈现。',
    icon: 'craft',
    color: '#10b981',
    colorRgb: '16, 185, 129',
    url: '/projects/craft',
    repo: '',
    tech: ['WebGL', 'Three.js', 'GLSL Shaders', 'GSAP'],
    features: ['生成式艺术与算法美学', 'GLSL 着色器实时实验', 'WebGL 交互装置', '代码可视化创意组件'],
    status: 'coming-soon',
  },
];

export const socialLinks = [
  { label: 'Email', href: 'mailto:jacktan2011@icloud.com', icon: 'mail' },
  { label: 'GitHub', href: 'https://github.com/jacktan-001', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jacktan2011', icon: 'linkedin' },
  { label: 'Instagram', href: 'https://instagram.com/jacktan2011', icon: 'instagram' },
  { label: '小红书', href: 'https://www.xiaohongshu.com/user/profile/JackTan', icon: 'xiaohongshu' },
];
