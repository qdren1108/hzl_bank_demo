import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Bank.module.css';
import ActionButton from './ActionButton';
import { fetchStandardEvents } from '../api/api';
import { useToast } from './ToastContext';

const StandardEventsSection = () => {
  const [searchText, setSearchText] = useState('');
  const [isMinimized, setIsMinimized] = useState(true); // 默认最小化
  const [showSearch, setShowSearch] = useState(false);
  const [standardEvents, setStandardEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasAttemptedFetch = useRef(false);
  const showToast = useToast();

  // 默认事件数据
  const defaultEvents = [
    {
      id: 1,
      eventName: "OTP検索",
      description: "ユーザOTP検索",
      parameters: "usrid"
    },
    {
      id: 2,
      eventName: "OTP更新",
      description: "ユーザOTP更新",
      parameters: "usrid"
    }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      // 如果已经尝试过获取数据，直接使用默认数据
      if (hasAttemptedFetch.current) {
        setStandardEvents(defaultEvents);
        return;
      }

      setIsLoading(true);

      try {
        const data = await fetchStandardEvents();
        setStandardEvents(data);
        showToast('标准事件库加载成功', 'success');
      } catch (error) {
        console.error('获取标准事件库失败:', error);
        setStandardEvents(defaultEvents);
        showToast(error.message || '标准事件库加载失败，使用默认数据', 'error', 5000);
      } finally {
        setIsLoading(false);
        hasAttemptedFetch.current = true;
      }
    };

    fetchEvents();
  }, [showToast]);

  // 搜索过滤逻辑
  const filteredEvents = standardEvents.filter(event =>
    event.eventName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    // 当最小化时，隐藏搜索框
    if (!isMinimized) {
      setShowSearch(false);
      setSearchText('');
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchText('');
    }
  };

  // 当最小化时，只显示一个小按钮
  if (isMinimized) {
    return (
      <div className={styles.minimizedSection} onClick={toggleMinimize}>
        <div className={styles.minimizedButton} title="展开标准事件库">
          <span>标准事件库</span>
          <span className={styles.expandIcon}>➕</span>
        </div>
      </div>
    );
  }

  // 展开状态下显示完整内容
  return (
    <div className={styles.section} id="standardEventsSection">
      <div className={styles.sectionTitle}>
        <div className={styles.sectionTitleText}>标准事件库</div>
        <div className={styles.titleActions}>
          <button
            className={styles.actionIcon}
            onClick={toggleSearch}
            title={showSearch ? "关闭搜索" : "搜索"}
          >
            🔍
          </button>
          <button
            className={styles.actionIcon}
            onClick={toggleMinimize}
            title="收起"
          >
            ➖
          </button>
        </div>
      </div>

      {showSearch && (
        <input
          type="text"
          className={styles.searchBox}
          placeholder="🔍 搜索标准事件"
          value={searchText}
          onChange={handleSearch}
          autoFocus
        />
      )}

      <div className={styles.buttonContainer} id="standardEvents">
        {isLoading ? (
          <div className={styles.loading}>加载中...</div>
        ) : (
          filteredEvents.map((event) => (
            <div key={`standard-${event.id}`}>
              <ActionButton
                text={event.eventName}
                title={`${event.description}${event.parameters ? `\n参数: ${event.parameters}` : ''}`}
                type="standard"
              />
            </div>
          ))
        )}

        {!isLoading && filteredEvents.length === 0 && (
          <div className={styles.noEvents}>
            {searchText ? `未找到匹配"${searchText}"的标准事件` : '无标准事件'}
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardEventsSection; 