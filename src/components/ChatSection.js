import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Bank.module.css';
import TagLabels from './TagLabels';

const ChatSection = () => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [eventCompositions, setEventCompositions] = useState({});
  const [processedEvents, setProcessedEvents] = useState(new Set()); // 跟踪已处理的事件
  const chatContainerRef = useRef(null);

  // 从本地存储加载事件组合信息
  useEffect(() => {
    const loadEventCompositions = () => {
      const savedEventCompositions = localStorage.getItem('eventCompositions');
      if (savedEventCompositions) {
        setEventCompositions(JSON.parse(savedEventCompositions));
      }
    };

    // 从本地存储恢复聊天记录
    const loadChatMessages = () => {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        setChatMessages(JSON.parse(savedMessages));
      }
    };

    // 初始加载
    loadEventCompositions();
    loadChatMessages();

    // 监听自定义事件 - 当点击ActionButton时触发
    const handleShowEventInChat = (e) => {
      const { eventName, error } = e.detail;
      console.log('接收到showEventInChat事件:', eventName, error ? `错误: ${error}` : '');

      // 防止短时间内重复处理相同事件
      const eventKey = `${eventName}-${Date.now()}`;
      if (!processedEvents.has(eventKey)) {
        const updatedProcessedEvents = new Set(processedEvents);
        updatedProcessedEvents.add(eventKey);
        setProcessedEvents(updatedProcessedEvents);

        // 在短暂延迟后允许再次处理相同事件
        setTimeout(() => {
          setProcessedEvents(prev => {
            const updated = new Set(prev);
            updated.delete(eventKey);
            return updated;
          });
        }, 1000);

        if (error) {
          // 如果有错误，显示错误信息
          addChatMessage('event', eventName);
          setTimeout(() => {
            addChatMessage('assistant', `❌ ${error}`);
          }, 300);
        } else {
          showEventInChat(eventName);
        }
      }
    };

    // 监听storage变化，以便在其他组件修改事件组合时更新
    const handleStorageChange = (e) => {
      if (e.key === 'eventCompositions') {
        loadEventCompositions();
      }
    };

    document.addEventListener('showEventInChat', handleShowEventInChat);
    window.addEventListener('storage', handleStorageChange);

    // 设置拖拽相关事件监听
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.addEventListener('dragover', handleDragOver);
      chatContainer.addEventListener('drop', handleDrop);
    }

    return () => {
      // 组件卸载时移除事件监听
      document.removeEventListener('showEventInChat', handleShowEventInChat);
      window.removeEventListener('storage', handleStorageChange);

      if (chatContainer) {
        chatContainer.removeEventListener('dragover', handleDragOver);
        chatContainer.removeEventListener('drop', handleDrop);
      }
    };
  }, [processedEvents]);

  // 保存聊天记录到本地存储
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  // 聊天容器自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleDragOver = (e) => {
    e.preventDefault();

    // 检查拖拽的数据类型
    const dataTypes = e.dataTransfer.types;
    if (dataTypes && dataTypes.includes('text/plain')) {
      e.dataTransfer.dropEffect = 'copy';

      // 添加拖拽目标高亮
      const chatContainer = document.getElementById('chatContainer');
      if (chatContainer) {
        chatContainer.classList.add(styles.dragOver);
      }
    }
  };

  const handleDragLeave = (e) => {
    // 移除拖拽目标高亮
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.classList.remove(styles.dragOver);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();

    // 移除拖拽目标高亮
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.classList.remove(styles.dragOver);
    }

    // 获取拖拽的事件名称
    const eventName = e.dataTransfer.getData('text/plain');
    console.log('接收到拖放事件:', eventName);

    // 检查是否为有效事件名称（空字符串表示可能是标准事件，不允许拖入）
    if (eventName) {
      // 创建一个唯一的事件标识符，避免短时间内重复处理
      const eventKey = `${eventName}-${Date.now()}`;
      if (!processedEvents.has(eventKey)) {
        const updatedProcessedEvents = new Set(processedEvents);
        updatedProcessedEvents.add(eventKey);
        setProcessedEvents(updatedProcessedEvents);

        // 在短暂延迟后从处理集合中移除
        setTimeout(() => {
          setProcessedEvents(prev => {
            const updated = new Set(prev);
            updated.delete(eventKey);
            return updated;
          });
        }, 1000);

        showEventInChat(eventName);
      }
    } else {
      addChatMessage('assistant', '标准事件不允许直接使用，请将其添加到银行事件中再使用。');
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      addChatMessage('user', message);
      setMessage('');

      // 简单的机器人响应
      setTimeout(() => {
        addChatMessage('assistant', '已收到您的消息，请问还有什么可以帮助您的吗？');
      }, 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpload = () => {
    console.log('上传文件');
    // 这里可以添加上传文件的逻辑
    addChatMessage('assistant', '文件上传功能尚未实现，请稍后再试。');
  };

  const handleClearChat = () => {
    setChatMessages([]);
    localStorage.removeItem('chatMessages');
    // 添加欢迎消息
    addChatMessage('assistant', '聊天记录已清空。有什么可以帮助您的吗？');
  };

  // 显示事件在聊天窗口
  const showEventInChat = (eventName) => {
    console.log('显示事件:', eventName, '组合信息:', eventCompositions);

    // 添加事件到聊天窗口
    addChatMessage('event', eventName);

    // 如果有子事件，则显示子事件
    const composition = eventCompositions[eventName];
    if (composition && composition.events && composition.events.length > 0) {
      console.log('事件组合:', composition);

      setTimeout(() => {
        addChatMessage('assistant', `事件 "${eventName}" 由以下组件构成：`);
      }, 300);

      composition.events.forEach((subEvent, index) => {
        setTimeout(() => {
          addChatMessage('event-component', subEvent);

          // 递归检查子事件的组成
          const subComposition = eventCompositions[subEvent];
          if (subComposition && subComposition.events && subComposition.events.length > 0) {
            setTimeout(() => {
              addChatMessage('assistant', `组件 "${subEvent}" 由以下标准事件构成：`);

              subComposition.events.forEach((standardEvent, idx) => {
                setTimeout(() => {
                  addChatMessage('standard-event', standardEvent);
                }, idx * 200);
              });
            }, 300);
          }
        }, (index + 1) * 400);
      });

      // 执行完成提示
      setTimeout(() => {
        addChatMessage('assistant', `事件 "${eventName}" 已执行完成。`);
      }, (composition.events.length + 1) * 500);
    } else {
      // 无子组件事件
      setTimeout(() => {
        addChatMessage('assistant', `事件 "${eventName}" 是基础事件，已直接执行。`);
      }, 300);
    }
  };

  // 添加消息到聊天窗口
  const addChatMessage = (type, content) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prevMessages => [...prevMessages, newMessage]);
  };

  // 渲染不同类型的消息
  const renderMessage = (message) => {
    switch (message.type) {
      case 'user':
        return (
          <div className={styles.userMessage}>
            <div className={styles.messageContent}>{message.content}</div>
            <div className={styles.messageTime}>{message.timestamp}</div>
          </div>
        );
      case 'assistant':
        return (
          <div className={styles.assistantMessage}>
            <div className={styles.messageContent}>{message.content}</div>
            <div className={styles.messageTime}>{message.timestamp}</div>
          </div>
        );
      case 'event':
        return (
          <div className={styles.eventMessage}>
            <div className={styles.eventIcon}>📋</div>
            <div className={styles.messageContent}>
              <div className={styles.eventTitle}>执行事件: {message.content}</div>
              <div className={styles.messageTime}>{message.timestamp}</div>
            </div>
          </div>
        );
      case 'event-component':
        return (
          <div className={styles.eventComponentMessage}>
            <div className={styles.eventIcon}>➤</div>
            <div className={styles.messageContent}>
              <div className={styles.eventComponentTitle}>{message.content}</div>
              <div className={styles.messageTime}>{message.timestamp}</div>
            </div>
          </div>
        );
      case 'standard-event':
        return (
          <div className={styles.standardEventMessage}>
            <div className={styles.eventIcon}>•</div>
            <div className={styles.messageContent}>
              <div className={styles.standardEventTitle}>{message.content}</div>
              <div className={styles.messageTime}>{message.timestamp}</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.section} id="chatSection">
      <div className={styles.sectionTitle}>
        <div className={styles.sectionTitleText}>事件管理&执行窗口（AI Chat）</div>
        <div className={styles.titleActions}>
          <button className={styles.actionIcon} onClick={handleClearChat} title="清空聊天">
            🗑️
          </button>
        </div>
      </div>

      {/* 添加标签组件 */}
      <div className={styles.chatSectionWrapper}>
        <TagLabels />
        <div
          className={styles.chatContainer}
          id="chatContainer"
          ref={chatContainerRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {chatMessages.length === 0 && (
            <div className={styles.chatAssistant}>
              <span role="img" aria-label="robot" style={{ marginRight: '10px', fontSize: '20px' }}>🤖</span>
              <span>智能银行助手 - 您好！请问有什么可以帮您？</span>
            </div>
          )}

          {chatMessages.map(message => (
            <div key={message.id} className={styles.message}>
              {renderMessage(message)}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chatInput}>
        <input
          type="text"
          className={styles.formInput}
          placeholder="您好！我是智能银行助手，请问有什么可以帮您？"
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.inputActions}>
          <button className={styles.sendButton} onClick={handleSendMessage} disabled={!message.trim()}>
            发送
          </button>
          <button className={styles.uploadButton} onClick={handleUpload}>
            上传
          </button>
        </div>
      </div>

      <div className={styles.dropHint}>将<strong>个人事件</strong>或<strong>银行事件</strong>拖拽到此处或点击事件可以查看详情和执行事件（标准事件不可直接使用）</div>
    </div>
  );
};

export default ChatSection;