/**
 * SubmitForm — 推荐歌单表单
 * 3 个 Tab（链接/手动/截图），歌单名称、作者、推荐语、标签
 * 截图上传含图片压缩
 */

import { useRef, useState } from 'react';
import type { SubmitPayload } from '../types';
import { safeUrl } from '../utils';

export interface SubmitFormProps {
  allTags: string[];
  onToast: (msg: string) => void;
}

type TabType = 'link' | 'manual' | 'screenshot';

export function SubmitForm({ allTags, onToast }: SubmitFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('link');
  const [linkUrl, setLinkUrl] = useState('');
  const [songListText, setSongListText] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
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

  const handleSubmit = async () => {
    // 验证
    if (activeTab === 'link' && linkUrl && !safeUrl(linkUrl)) {
      onToast('请输入有效的链接（以 http:// 或 https:// 开头）');
      return;
    }
    if (!playlistName || !authorName) {
      onToast('请填写歌单名称和您的名字');
      return;
    }

    setSubmitting(true);

    const payload: SubmitPayload = {
      type: activeTab,
      linkUrl: linkUrl.trim(),
      songList: songListText.trim(),
      playlistName: playlistName.trim(),
      authorName: authorName.trim(),
      description: description.trim(),
      tags: selectedTags,
    };
    if (activeTab === 'screenshot' && screenshotData) {
      payload.screenshotData = screenshotData;
    }

    try {
      const res = await fetch(import.meta.env.BASE_URL + 'api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowSuccess(true);
        // 5 秒后恢复表单
        setTimeout(() => {
          setShowSuccess(false);
          setSubmitting(false);
          setLinkUrl('');
          setSongListText('');
          setPlaylistName('');
          setAuthorName('');
          setDescription('');
          setSelectedTags([]);
          setScreenshotData(null);
        }, 5000);
      } else {
        onToast('提交失败: ' + (data.error || '未知错误'));
        setSubmitting(false);
      }
    } catch {
      onToast('网络错误，请稍后重试');
      setSubmitting(false);
    }
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
          fontSize: '32px',
          fontWeight: 700,
          letterSpacing: '-1px',
          marginBottom: '8px',
        }}
      >
        推荐歌单
      </h2>
      <p
        className="section-desc"
        style={{ color: 'var(--gray-500)', fontSize: '15px', marginBottom: '40px' }}
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
        {!showSuccess ? (
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
                <label className="form-label">
                  平台链接<span className="req">*</span>
                </label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="粘贴 Apple Music / Spotify / 网易云 歌单链接"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
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
              <label className="form-label">
                歌单名称<span className="req">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="给你的歌单起个名字"
                maxLength={100}
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
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
            </div>

            <div className="form-group">
              <label className="form-label">
                你的名字<span className="req">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="你的名字或昵称"
                maxLength={50}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
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
            </div>

            <div className="form-group">
              <label className="form-label">
                推荐语<span className="opt">选填</span>
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
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-pill${selectedTags.includes(tag) ? ' active' : ''}`}
                    onClick={() => toggleTag(tag)}
                    type="button"
                    style={{
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: 500,
                      border: '1.5px solid var(--gray-200)',
                      transition: 'all .2s',
                      color: selectedTags.includes(tag) ? 'var(--teal)' : 'var(--gray-600)',
                      borderColor: selectedTags.includes(tag) ? 'var(--teal)' : 'var(--gray-200)',
                      background: selectedTags.includes(tag) ? 'var(--tag-bg)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-submit"
              onClick={handleSubmit}
              type="button"
              disabled={submitting}
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
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? '提交中...' : '提交推荐'}
            </button>
          </>
        ) : (
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
        )}
      </div>
    </section>
  );
}
