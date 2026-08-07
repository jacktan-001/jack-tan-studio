/**
 * SubmitForm — 推荐歌单表单
 * 3 个 Tab（链接/手动/截图），歌单标题、作者、描述、标签
 * 截图上传含图片压缩
 */

import { useOptimistic, useRef, useState, useTransition } from 'react';
import type { SubmitPayload } from '../types';
import { safeUrl } from '../utils';
import { assetUrl } from '../assetBase';

export interface SubmitFormProps {
  allTags: string[];
  onToast: (msg: string) => void;
}

type TabType = 'link' | 'manual' | 'screenshot';

/**
 * 提交状态：
 * - idle：空闲，可填写并提交
 * - submitting：提交中（乐观状态，点击后立即显示）
 * - success：提交成功，展示感谢页
 */
type SubmissionStatus = 'idle' | 'submitting' | 'success';

export function SubmitForm({ allTags, onToast }: SubmitFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('link');
  const [linkUrl, setLinkUrl] = useState('');
  const [songListText, setSongListText] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 即时校验：字段级错误信息。仅在 onBlur / 提交时写入，避免用户边打字边报错。
  type FieldName = 'linkUrl' | 'playlistName' | 'authorName';
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});

  /** 返回错误文案；无错误返回空串 */
  const getFieldError = (name: FieldName, value: string): string => {
    const v = value.trim();
    switch (name) {
      case 'linkUrl':
        // 链接为选填，但一旦填了就必须是合法的 http(s) 链接
        if (v && !safeUrl(v)) return '请输入有效的链接（以 http:// 或 https:// 开头）';
        return '';
      case 'playlistName':
        return v ? '' : '请填写歌单标题';
      case 'authorName':
        return v ? '' : '请填写作者';
    }
  };

  /** onBlur 时校验单个字段 */
  const validateOnBlur = (name: FieldName, value: string) => {
    const msg = getFieldError(name, value);
    setFieldErrors((prev) => {
      if (msg) return { ...prev, [name]: msg };
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  /** 用户重新输入时立刻清掉该字段的错误，避免"已修好但红字还在" */
  const clearFieldError = (name: FieldName) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // 提交状态：真实状态由 useState 持有，useOptimistic 在 transition 中立即乐观显示 "submitting"。
  // 后台异步执行真实 API 调用；transition 结束后乐观值自动回退到真实状态。
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [optimisticStatus, addOptimisticStatus] = useOptimistic(
    submissionStatus,
    (_current, next: SubmissionStatus) => next,
  );
  const [, startTransition] = useTransition();

  const toggleTag = (tag: string) => {
    if (tag === '其他') {
      setSelectedTags((prev) => {
        if (prev.includes('其他')) {
          // 取消「其他」：同时移除已输入的自定义标签
          setCustomTag('');
          return prev.filter((t) => t !== '其他' && t !== customTag);
        }
        return [...prev, '其他'];
      });
      return;
    }
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // 将自定义标签写入选中列表（替换占位符「其他」）
  const applyCustomTag = () => {
    const value = customTag.trim();
    if (!value) return;
    setSelectedTags((prev) => {
      const withoutOther = prev.filter((t) => t !== '其他');
      return [...new Set([...withoutOther, value])];
    });
  };

  // 截图上传：压缩图片并存储为 DataURL
  const handleUpload = (input: HTMLInputElement) => {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      onToast('文件不能超过 5MB');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setScreenshotData(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    // 验证：与 onBlur 复用同一套规则，结果同时写进 fieldErrors，
    // 这样错误既有 toast 也有字段级红字 + aria-invalid，屏幕阅读器可感知。
    const errors: Partial<Record<FieldName, string>> = {};
    if (activeTab === 'link') {
      const e = getFieldError('linkUrl', linkUrl);
      if (e) errors.linkUrl = e;
    }
    const nameErr = getFieldError('playlistName', playlistName);
    if (nameErr) errors.playlistName = nameErr;
    const authorErr = getFieldError('authorName', authorName);
    if (authorErr) errors.authorName = authorErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const first = (['linkUrl', 'playlistName', 'authorName'] as FieldName[]).find((k) => errors[k]);
      if (first) {
        onToast(errors[first]!);
        // 把焦点移到第一个出错的字段，键盘/读屏用户不用自己找
        document.getElementById(`submit-${first}`)?.focus();
      }
      return;
    }
    setFieldErrors({});

    // 标签：过滤占位符「其他」，若用户填写了自定义内容则替换加入
    const finalTags = selectedTags
      .filter((t) => t !== '其他')
      .concat(customTag.trim() ? [customTag.trim()] : []);

    const payload: SubmitPayload = {
      type: activeTab,
      linkUrl: linkUrl.trim(),
      songList: songListText.trim(),
      playlistName: playlistName.trim(),
      authorName: authorName.trim(),
      description: description.trim(),
      tags: Array.from(new Set(finalTags)),
    };
    if (activeTab === 'screenshot' && screenshotData) {
      payload.screenshotData = screenshotData;
    }

    // 在 transition 中提交：addOptimisticStatus 立即把 UI 切到 "submitting"，
    // 真实 API 调用在后台异步进行。transition 结束后乐观值自动回退到真实状态。
    startTransition(async () => {
      addOptimisticStatus('submitting');

      try {
        const res = await fetch(assetUrl('api/submit'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          // 成功：更新真实状态为 success（乐观值回退后 UI 自然显示成功页）
          setSubmissionStatus('success');
          // 5 秒后恢复表单
          setTimeout(() => {
            setSubmissionStatus('idle');
            setLinkUrl('');
            setSongListText('');
            setPlaylistName('');
            setAuthorName('');
            setDescription('');
            setSelectedTags([]);
            setCustomTag('');
            setScreenshotData(null);
            setIsExpanded(false);
          }, 5000);
        } else {
          // 失败：回退到 idle 并提示错误
          setSubmissionStatus('idle');
          onToast('提交失败: ' + (data.error || '未知错误'));
        }
      } catch {
        // 网络错误：回退到 idle
        setSubmissionStatus('idle');
        onToast('网络错误，请稍后重试');
      }
    });
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'link', label: '音乐平台链接' },
    { key: 'manual', label: '手动输入歌曲' },
    { key: 'screenshot', label: '上传截图' },
  ];

  return (
    <section
      className="section"
      id="recommend"
      style={{
        padding: '80px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      <h2
        className="section-title"
        style={{
          fontSize: 'clamp(28px, 5vw, 36px)',
          fontWeight: 700,
          letterSpacing: '-1px',
          marginBottom: '8px',
        }}
      >
        推荐歌单
      </h2>
      <p
        className="section-desc"
        style={{ color: 'var(--gray-500)', fontSize: '16px', marginBottom: '40px', lineHeight: 1.6 }}
      >
        分享你的音乐故事
      </p>

      <div
        className="form-card"
        style={{
          background: 'var(--card)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          padding: '32px',
          maxWidth: '640px',
          margin: '0 auto',
        }}
      >
        {optimisticStatus === 'success' ? (
          /* Success state */
          <div className="form-success" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div
              className="form-success-icon"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--tag-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--teal)',
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
              感谢你的推荐！
            </h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
              我们会尽快审核并展示在页面上
            </p>
          </div>
        ) : !isExpanded ? (
          /* 默认折叠收起 */
          <div
            onClick={() => setIsExpanded(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsExpanded(true);
              }
            }}
            style={{
              padding: '28px',
              textAlign: 'center',
              cursor: 'pointer',
              borderRadius: '20px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
              推荐你的歌单
            </h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
              点击展开推荐表单
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div
              className="form-tabs"
              style={{
                display: 'flex',
                gap: '4px',
                background: 'var(--gray-100)',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '28px',
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`form-tab${activeTab === tab.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                  type="button"
                  style={{
                    flex: 1,
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: 500,
                    borderRadius: '10px',
                    transition: 'all .2s',
                    color: activeTab === tab.key ? 'var(--gray-800)' : 'var(--gray-500)',
                    background:
                      activeTab === tab.key ? 'var(--card-solid)' : 'transparent',
                    boxShadow:
                      activeTab === tab.key
                        ? '0 1px 4px rgba(0,0,0,0.06)'
                        : 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'link' && (
              <div className="form-group">
                <label className="form-label" htmlFor="submit-linkUrl">
                  平台链接<span className="req">*</span>
                </label>
                <input
                  id="submit-linkUrl"
                  type="url"
                  className="form-input"
                  placeholder="粘贴 Apple Music / Spotify / 网易云 歌单链接"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    clearFieldError('linkUrl');
                  }}
                  onBlur={(e) => validateOnBlur('linkUrl', e.target.value)}
                  aria-invalid={fieldErrors.linkUrl ? true : undefined}
                  aria-describedby={fieldErrors.linkUrl ? 'submit-linkUrl-error' : undefined}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'border-color .2s',
                    outline: 'none',
                    background: 'var(--input-bg)',
                    color: 'var(--gray-800)',
                  }}
                />
                {fieldErrors.linkUrl && (
                  <p className="form-error" id="submit-linkUrl-error" role="alert">
                    {fieldErrors.linkUrl}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'manual' && (
              <div className="form-group">
                <label className="form-label">歌曲列表</label>
                <textarea
                  className="form-input"
                  placeholder={
                    '每行一首歌，格式：歌名 - 歌手\n例如：\n晴天 - 周杰伦\n稻香 - 周杰伦'
                  }
                  value={songListText}
                  onChange={(e) => setSongListText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'border-color .2s',
                    outline: 'none',
                    background: 'var(--input-bg)',
                    color: 'var(--gray-800)',
                    minHeight: '100px',
                    resize: 'vertical',
                  }}
                />
              </div>
            )}

            {activeTab === 'screenshot' && (
              <div className="form-group">
                <label className="form-label">截图</label>
                <div
                  className="upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  style={{
                    border: '2px dashed var(--gray-200)',
                    borderRadius: '16px',
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--gray-400)',
                    transition: 'all .2s',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }}
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div style={{ fontSize: '14px' }}>点击上传截图</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    支持 JPG、PNG 格式，自动压缩
                  </div>
                  {screenshotData && (
                    <img
                      src={screenshotData}
                      alt="截图预览"
                      style={{
                        maxHeight: '200px',
                        margin: '12px auto 0',
                        borderRadius: '12px',
                      }}
                    />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => handleUpload(e.target)}
                />
              </div>
            )}

            {/* Common fields */}
            <div className="form-group">
              <label className="form-label" htmlFor="submit-playlistName">
                歌单标题<span className="req">*</span>
              </label>
              <input
                id="submit-playlistName"
                type="text"
                className="form-input"
                placeholder="给歌单起个标题"
                maxLength={100}
                value={playlistName}
                onChange={(e) => {
                  setPlaylistName(e.target.value);
                  clearFieldError('playlistName');
                }}
                onBlur={(e) => validateOnBlur('playlistName', e.target.value)}
                aria-invalid={fieldErrors.playlistName ? true : undefined}
                aria-describedby={fieldErrors.playlistName ? 'submit-playlistName-error' : undefined}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'border-color .2s',
                  outline: 'none',
                  background: 'var(--input-bg)',
                  color: 'var(--gray-800)',
                }}
              />
              {fieldErrors.playlistName && (
                <p className="form-error" id="submit-playlistName-error" role="alert">
                  {fieldErrors.playlistName}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="submit-authorName">
                作者<span className="req">*</span>
              </label>
              <input
                id="submit-authorName"
                type="text"
                className="form-input"
                placeholder="作者名或昵称"
                maxLength={50}
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  clearFieldError('authorName');
                }}
                onBlur={(e) => validateOnBlur('authorName', e.target.value)}
                aria-invalid={fieldErrors.authorName ? true : undefined}
                aria-describedby={fieldErrors.authorName ? 'submit-authorName-error' : undefined}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'border-color .2s',
                  outline: 'none',
                  background: 'var(--input-bg)',
                  color: 'var(--gray-800)',
                }}
              />
              {fieldErrors.authorName && (
                <p className="form-error" id="submit-authorName-error" role="alert">
                  {fieldErrors.authorName}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                描述<span className="opt">选填</span>
              </label>
              <textarea
                className="form-input"
                placeholder="分享一下这个歌单的故事吧..."
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'border-color .2s',
                  outline: 'none',
                  background: 'var(--input-bg)',
                  color: 'var(--gray-800)',
                  minHeight: '72px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                标签<span className="opt">选填</span>
              </label>
              <div className="tag-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[...allTags, '其他'].map((tag) => {
                  const isOther = tag === '其他';
                  const isSelected = isOther
                    ? selectedTags.includes('其他') || (customTag.trim() && selectedTags.includes(customTag.trim()))
                    : selectedTags.includes(tag);

                  if (isOther) {
                    return (
                      <div key="other" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
                        <button
                          className={`tag-pill${isSelected ? ' active' : ''}`}
                          onClick={() => toggleTag('其他')}
                          type="button"
                          style={{
                            padding: '6px 14px',
                            borderRadius: '999px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: '1.5px solid var(--gray-200)',
                            transition: 'all .2s',
                            color: isSelected ? 'var(--teal)' : 'var(--gray-600)',
                            borderColor: isSelected ? 'var(--teal)' : 'var(--gray-200)',
                            background: isSelected ? 'var(--tag-bg)' : 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          其他
                        </button>
                        {isSelected && (
                          <input
                            type="text"
                            value={customTag}
                            onChange={(e) => setCustomTag(e.target.value)}
                            onBlur={applyCustomTag}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                applyCustomTag();
                              }
                            }}
                            placeholder="输入自定义标签"
                            maxLength={20}
                            style={{
                              flex: 1,
                              minWidth: '120px',
                              maxWidth: '200px',
                              padding: '6px 12px',
                              fontSize: '13px',
                            }}
                          />
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={tag}
                      className={`tag-pill${isSelected ? ' active' : ''}`}
                      onClick={() => toggleTag(tag)}
                      type="button"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontSize: '13px',
                        fontWeight: 500,
                        border: '1.5px solid var(--gray-200)',
                        transition: 'all .2s',
                        color: isSelected ? 'var(--teal)' : 'var(--gray-600)',
                        borderColor: isSelected ? 'var(--teal)' : 'var(--gray-200)',
                        background: isSelected ? 'var(--tag-bg)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              className="btn-submit"
              onClick={handleSubmit}
              type="button"
              disabled={optimisticStatus === 'submitting'}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--teal)',
                color: '#fff',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: 600,
                transition: 'all .2s',
                marginTop: '8px',
                border: 'none',
                cursor: optimisticStatus === 'submitting' ? 'not-allowed' : 'pointer',
                opacity: optimisticStatus === 'submitting' ? 0.6 : 1,
              }}
            >
              {optimisticStatus === 'submitting' ? '提交中...' : '提交推荐'}
            </button>

            {/* 收起表单 */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px',
                fontSize: '14px',
                color: 'var(--gray-500)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              收起表单
            </button>
          </>
        )}
      </div>
    </section>
  );
}
