/**
 * Layer 7: Effects — GSAP 动画预设
 * GSAP 3.12 动画时间线与预设
 * 高级滚动动画与复杂序列
 */

/** GSAP 类型导入（运行时动态导入） */
type GSAPContext = {
  timeline: (vars?: Record<string, unknown>) => GSAPTimeline;
  from: (targets: string | Element | Element[], vars: Record<string, unknown>) => unknown;
  to: (targets: string | Element | Element[] | object, vars: Record<string, unknown>) => unknown;
  fromTo: (
    targets: string | Element | Element[],
    fromVars: Record<string, unknown>,
    toVars: Record<string, unknown>,
  ) => unknown;
  set: (targets: string | Element | Element[], vars: Record<string, unknown>) => unknown;
  registerPlugin: (plugin: unknown) => void;
};

type GSAPTimeline = {
  from: (targets: string | Element | Element[], vars: Record<string, unknown>, position?: string) => GSAPTimeline;
  to: (targets: string | Element | Element[], vars: Record<string, unknown>, position?: string) => GSAPTimeline;
  fromTo: (
    targets: string | Element | Element[],
    fromVars: Record<string, unknown>,
    toVars: Record<string, unknown>,
    position?: string,
  ) => GSAPTimeline;
};

let gsapInstance: GSAPContext | null = null;

/** 动态加载 GSAP */
export async function loadGSAP(): Promise<GSAPContext | null> {
  if (gsapInstance) return gsapInstance;
  try {
    const mod = await import('gsap');
    gsapInstance = mod.gsap as unknown as GSAPContext;
    return gsapInstance;
  } catch {
    return null;
  }
}

/** 动态加载 ScrollTrigger 插件 */
export async function loadScrollTrigger(): Promise<unknown | null> {
  const gsap = await loadGSAP();
  if (!gsap) return null;
  try {
    const mod = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(mod.ScrollTrigger);
    return mod.ScrollTrigger;
  } catch {
    return null;
  }
}

/** 滚动入场动画预设 */
export const scrollPresets = {
  /** 从下淡入 */
  fadeInUp: { from: { opacity: 0, y: 60 }, duration: 0.8, ease: 'power3.out' },
  /** 从左滑入 */
  slideInLeft: { from: { opacity: 0, x: -80 }, duration: 0.7, ease: 'power3.out' },
  /** 从右滑入 */
  slideInRight: { from: { opacity: 0, x: 80 }, duration: 0.7, ease: 'power3.out' },
  /** 放大入场 */
  scaleIn: { from: { opacity: 0, scale: 0.85 }, duration: 0.6, ease: 'back.out(1.4)' },
  /** 模糊到清晰 */
  blurIn: { from: { opacity: 0, filter: 'blur(20px)' }, to: { opacity: 1, filter: 'blur(0px)' }, duration: 0.8, ease: 'power2.out' },
  /** 3D 翻转入场 */
  flipIn: { from: { opacity: 0, rotateY: 45 }, duration: 0.7, ease: 'power3.out' },
} as const;

/** 创建滚动入场时间线 */
export async function createScrollTimeline(
  selector: string,
  preset: keyof typeof scrollPresets = 'fadeInUp',
): Promise<void> {
  const gsap = await loadGSAP();
  const ScrollTrigger = await loadScrollTrigger();
  if (!gsap || !ScrollTrigger) return;

  const config = scrollPresets[preset];
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  gsap.from(selector, {
    ...('from' in config ? config.from : {}),
    duration: config.duration,
    ease: config.ease,
    scrollTrigger: {
      trigger: selector,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
    stagger: 0.15,
  });
}

/** 视差滚动 */
export async function createParallax(
  selector: string,
  intensity: number = 0.3,
): Promise<void> {
  const gsap = await loadGSAP();
  const ScrollTrigger = await loadScrollTrigger();
  if (!gsap || !ScrollTrigger) return;

  gsap.to(selector, {
    yPercent: -intensity * 100,
    ease: 'none',
    scrollTrigger: {
      trigger: selector,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
}

/** 数字递增动画 */
export async function animateCounter(
  selector: string,
  end: number,
  options: { duration?: number; prefix?: string; suffix?: string } = {},
): Promise<void> {
  const gsap = await loadGSAP();
  if (!gsap) return;
  const { duration = 2, prefix = '', suffix = '' } = options;
  const obj = { val: 0 };
  const el = document.querySelector(selector);
  if (!el) return;

  gsap.to(obj, {
    val: end,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
    },
  });
}
