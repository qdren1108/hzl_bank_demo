import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles/Bank.module.css';
import ParameterModal from './ParameterModal';
import { executeEventApi } from '../api/api';
import { useToast } from './ToastContext';

const ActionButton = ({ text, title, type = '' }) => {
  const buttonRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showParameterModal, setShowParameterModal] = useState(false);
  const showToast = useToast();

  // 点击动画效果
  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  // 标准事件不可拖拽到聊天窗口及点击显示
  const isStandardEvent = type === 'standard';

  // 处理事件执行
  const handleEventExecution = async (eventName, parameters) => {
    try {
      // 构建完整的事件数据结构
      const requestBody = {
        id: 1,
        eventName: eventName,
        description: "ユーザOTP開始",
        pevents: [
          {
            id: 1,
            eventName: "OTP検索",
            description: "ユーザOTP検索",
            parameters: parameters['OTP検索']?.usrid || '',
            pevents: "/bank/transfer"
          },
          {
            id: 2,
            eventName: "OTP更新",
            description: "ユーザOTP更新",
            parameters: parameters['OTP更新']?.usrid || '',
            pevents: "/bank/transfer"
          }
        ],
        timestamp: new Date().toISOString()
      };

      await executeEventApi(requestBody);
      showToast('事件执行成功', 'success', 3000);

      // 执行成功后再触发显示事件
      showEventInChat(eventName);
    } catch (error) {
      console.error('事件执行失败:', error);

      // 根据错误类型显示不同的错误信息
      let errorMessage = '事件执行失败';
      if (error.message.includes('超时')) {
        errorMessage = '服务器响应超时，请稍后重试';
      } else if (error.message.includes('网络连接')) {
        errorMessage = '网络连接异常，请检查网络设置';
      } else {
        errorMessage = `事件执行失败: ${error.message}`;
      }

      showToast(errorMessage, 'error', 5000);

      // 执行失败时也在聊天窗口显示错误信息
      const event = new CustomEvent('showEventInChat', {
        detail: {
          eventName,
          error: errorMessage
        },
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    }
  };

  const handleClick = (e) => {
    // 阻止事件冒泡，避免与父元素的点击事件冲突
    e.stopPropagation();

    // 如果是标准事件，则不执行点击操作
    if (isStandardEvent) {
      return;
    }

    // 设置点击状态，触发动画
    setIsClicked(true);

    // 显示参数设置窗口
    setShowParameterModal(true);
  };

  const handleParameterConfirm = (parameters) => {
    // 执行事件
    handleEventExecution(text, parameters);

    // 在Chat中显示事件
    console.log('Action按钮点击:', text);
    showEventInChat(text);
  };

  const handleDragStart = (e) => {
    // 如果是标准事件，则不允许拖拽到聊天窗口
    if (isStandardEvent) {
      e.dataTransfer.effectAllowed = 'move'; // 只允许排序移动
      // 对于标准事件，不设置数据，以此来防止其被拖放到聊天窗口
    } else {
      e.dataTransfer.setData('text/plain', text);
      e.dataTransfer.effectAllowed = 'copy';
    }

    // 设置拖拽图像（可选）
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(buttonRef.current, rect.width / 2, rect.height / 2);
      setIsDragging(true);
      buttonRef.current.classList.add(styles.dragging);
    }
  };

  const handleDragEnd = () => {
    if (buttonRef.current) {
      setIsDragging(false);
      buttonRef.current.classList.remove(styles.dragging);
    }
  };

  const handleMouseEnter = () => {
    if (title) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // 显示事件在聊天窗口的辅助函数
  const showEventInChat = (eventName) => {
    console.log('触发显示事件:', eventName);
    // 创建自定义事件
    const event = new CustomEvent('showEventInChat', {
      detail: { eventName },
      bubbles: true, // 允许事件冒泡
      cancelable: true // 允许事件被取消
    });
    document.dispatchEvent(event);

    // 触发视觉效果
    // 可以在这里添加额外的动画或反馈
    if (buttonRef.current) {
      buttonRef.current.classList.add(styles.clicked);
      setTimeout(() => {
        buttonRef.current.classList.remove(styles.clicked);
      }, 300);
    }
  };

  return (
    <div className={styles.actionButtonWrapper}>
      <button
        ref={buttonRef}
        className={`${styles.actionButton} ${isClicked ? styles.clicked : ''} ${isDragging ? styles.dragging : ''}`}
        onClick={handleClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        draggable={!isStandardEvent}
        title={title}
      >
        {text}
      </button>
      {showTooltip && title && (
        <div className={styles.tooltip}>
          {title}
        </div>
      )}
      <ParameterModal
        isOpen={showParameterModal}
        onClose={() => setShowParameterModal(false)}
        eventName={text}
        onConfirm={handleParameterConfirm}
      />
    </div>
  );
};

export default ActionButton; 