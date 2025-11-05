import React, { useState, useRef } from 'react';
import type { MediaNode } from '../../types/conversation';
import './MediaCard.css';

interface MediaCardProps {
  node: MediaNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate?: (nodeId: string, updates: Partial<MediaNode>) => void;
}

/**
 * Media 组件
 * 支持图片、视频、音频文件，以卡片形式展示
 * 与对话卡片有明显的视觉区别
 */
export const MediaCard: React.FC<MediaCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (node.mediaType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (node.mediaType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getMediaIcon = () => {
    switch (node.mediaType) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      default:
        return '📎';
    }
  };

  const renderMediaContent = () => {
    switch (node.mediaType) {
      case 'image':
        return (
          <img
            src={node.url}
            alt={node.filename}
            className="media-image"
            style={{
              width: node.width ? `${node.width}px` : 'auto',
              height: node.height ? `${node.height}px` : 'auto',
            }}
          />
        );

      case 'video':
        return (
          <div className="media-video-container">
            <video
              ref={videoRef}
              src={node.url}
              className="media-video"
              controls
              style={{
                width: node.width ? `${node.width}px` : '400px',
                height: node.height ? `${node.height}px` : 'auto',
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="media-audio-container">
            <div className="media-audio-visual">
              <button
                className="media-audio-play-btn"
                onClick={handlePlayPause}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <div className="media-audio-info">
                <div className="media-audio-icon">🎵</div>
                <div className="media-audio-name">{node.filename}</div>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={node.url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`media-card ${node.mediaType} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(node.id)}
    >
      {/* 卡片头部 */}
      <div className="media-card-header">
        <div className="media-card-type">
          <span className="media-icon">{getMediaIcon()}</span>
          <span className="media-type-label">
            {node.mediaType === 'image' ? '图片' : 
             node.mediaType === 'video' ? '视频' : '音频'}
          </span>
        </div>
        <button
          className="media-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          title="删除"
        >
          ×
        </button>
      </div>

      {/* 媒体内容 */}
      <div className="media-card-content">
        {renderMediaContent()}
      </div>

      {/* 文件名 */}
      <div className="media-card-footer">
        <span className="media-filename" title={node.filename}>
          {node.filename}
        </span>
      </div>
    </div>
  );
};

