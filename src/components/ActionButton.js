import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles/Bank.module.css';
import ParameterModal from './ParameterModal';
import { executeEventApi } from '../api/api';
import { useToast } from './ToastContext';

const ActionButton = ({ text, title, type = '', onEventSaved }) => {
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
  const handleEventExecution = async (eventName, eventData) => {
    try {
      // 使用传入的事件数据构建请求体
      const requestBody = {
        name: eventName,
        description: eventData.description || "ユーザOTP開始",
        events: eventData.events.map(event => ({
          ...event,
          params: event.params || {}
        }))
      };

      console.log('执行事件请求体:', JSON.stringify(requestBody, null, 2));

      // 调用执行API
      await executeEventApi(requestBody);
      showToast('事件执行成功', 'success', 3000);

      // 显示在聊天窗口
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
    // 检查是否是从个人事件库执行
    const eventCompositions = JSON.parse(localStorage.getItem('eventCompositions') || '{}');
    const bankEvents = JSON.parse(localStorage.getItem('bankEvents') || '[]');
    const bankEvent = bankEvents.find(event => event.name === text);

    if (bankEvent) {
      // 如果是银行事件，更新每个子事件的参数
      const updatedEvents = bankEvent.events.map(event => ({
        ...event,
        params: parameters[event.name] || event.params
      }));

      // 执行事件
      handleEventExecution(text, {
        ...bankEvent,
        events: updatedEvents
      });
    } else {
      // 如果是个人事件，使用保存的参数
      const savedEvent = eventCompositions[text];
      const paramsToUse = savedEvent?.parameters || parameters;
      handleEventExecution(text, paramsToUse);
    }

    // 在Chat中显示事件
    console.log('Action按钮点击:', text);
    showEventInChat(text);
  };

  const handleSaveToPersonal = (eventName, parameters) => {
    // 获取当前个人事件库
    const savedEvents = JSON.parse(localStorage.getItem('personalEvents') || '[]');
    const eventCompositions = JSON.parse(localStorage.getItem('eventCompositions') || '{}');

    // 检查事件名称是否已存在
    if (savedEvents.includes(eventName)) {
      showToast(`个人事件 "${eventName}" 已存在`, 'error');
      return;
    }

    // 添加新事件到个人事件库
    savedEvents.push(eventName);

    // 构建事件组合信息，包含完整的参数信息
    eventCompositions[eventName] = {
      events: [eventName],
      parameters: parameters,  // 直接保存完整的参数对象
      type: 'bank',  // 标记这是一个银行事件
      timestamp: new Date().toISOString()
    };

    // 保存到localStorage
    localStorage.setItem('personalEvents', JSON.stringify(savedEvents));
    localStorage.setItem('eventCompositions', JSON.stringify(eventCompositions));

    // 通知父组件更新事件列表
    if (onEventSaved) {
      onEventSaved(savedEvents, eventCompositions);
    }

    showToast('事件已保存到个人事件库', 'success');
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
        onSave={handleSaveToPersonal}
      />
    </div>
  );
};

export default ActionButton; 