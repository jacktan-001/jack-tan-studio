/**
 * Toast — 通知提示组件
 * 从原 app.js 的 showToast() 迁移
 */

import { useCallback, useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  show: boolean;
  onHide: () => void;
  /** 显示时长（毫秒），默认 3000 */
  duration?: number;
}

export function Toast({ message, show, onHide, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onHide, duration]);

  return (
    <div
      className="toast"
      style={{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: show
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(8px)',
        background: 'var(--gray-900)',
        color: 'var(--bg)',
        padding: '12px 24px',
        borderRadius: '99px',
        fontSize: '14px',
        zIndex: 300,
        opacity: show ? 1 : 0,
        transition: 'all .3s',
        pointerEvents: 'none',
        boxShadow: 'var(--shadow)',
        whiteSpace: 'nowrap',
        maxWidth: '90vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {message}
    </div>
  );
}

/** Toast 状态管理 Hook */
export function useToast() {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setShow(true);
  }, []);

  const hideToast = useCallback(() => {
    setShow(false);
  }, []);

  return { message, show, showToast, hideToast };
}
