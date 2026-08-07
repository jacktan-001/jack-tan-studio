/**
 * ProjectHost — 单页壳层的子应用挂载容器
 *
 * 当 studio 客户端路由进入某个已上线项目（如 /projects/jack-wave）时，本组件
 * 懒加载该子应用的 bootstrap 模块，把应用渲染进当前容器。容器之外的外壳
 * （StudioBar / GlobalAudioPlayer / useGlobalAudioPlayer 的 <audio>）完全不卸载，
 * 因此跨应用导航时音乐播放不中断。
 *
 * - player / onError 通过 ref 传入 mount，避免 player 对象身份变化触发重复挂载。
 * - 仅按 id 重新挂载；player 状态更新不会重挂应用。
 * - 子应用按 id 注册到 REGISTRY；未注册（如尚未接入单页化的 pose/tan）则回退到硬跳转。
 */

import { useEffect, useRef } from 'react';
import type { GlobalAudioPlayerReturn } from '@jack-tan/studio-core';

type MountFn = (
  container: HTMLElement,
  props: { player: GlobalAudioPlayerReturn; onError?: (message: string) => void },
) => void;
type UnmountFn = () => void;

const REGISTRY: Record<string, () => Promise<{ mount: MountFn; unmount: UnmountFn }>> = {
  wave: () => import('jack-wave/bootstrap'),
  pose: () => import('jack-pose/bootstrap'),
  tan: () => import('jack-tan/bootstrap'),
};

export default function ProjectHost({
  id,
  player,
  onError,
}: {
  id: string;
  player: GlobalAudioPlayerReturn;
  onError?: (message: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const playerRef = useRef(player);
  playerRef.current = player;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const loader = REGISTRY[id];
    if (!loader) return;
    let unmount: UnmountFn | null = null;
    let cancelled = false;
    loader()
      .then((mod) => {
        if (cancelled || !ref.current) return;
        mod.mount(ref.current, {
          player: playerRef.current!,
          onError: onErrorRef.current,
        });
        unmount = mod.unmount;
      })
      .catch((err: unknown) => {
        console.error('[ProjectHost] 子应用挂载失败:', err);
      });
    return () => {
      cancelled = true;
      unmount?.();
    };
    // 仅按 id 挂载；player 状态变化不触发重挂（player 通过 ref 读取最新值）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // data-embedded：供样式层区分「嵌入外壳」与「独立部署」，
  // 用于抵消子应用为自己的 StudioBar 预留的顶部间距（外壳 .page-wrap 已统一预留）。
  return <div ref={ref} data-project={id} data-embedded="true" />;
}
