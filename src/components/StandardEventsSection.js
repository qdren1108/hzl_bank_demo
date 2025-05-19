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
      name: "OTP検索",
      description: "ユーザOTP検索",
      tag: "",
      httpUrl: "http://9.197.76.157:8080/api/otp/{userid}/status",
      httpMethod: "get",
      params: {
        userid: ""
      }
    },
    {
      name: "OTP更新",
      description: "ユーザOTP更新",
      tag: "",
      httpUrl: "http://9.197.76.157:8080/api/otp/status",
      httpMethod: "put",
      params: {
        userid: "",
        newStatus: ""
      }
    }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      if (hasAttemptedFetch.current) {
        setStandardEvents(defaultEvents);
        // 即使使用默认数据也要保存到localStorage
        localStorage.setItem('standardEvents', JSON.stringify(defaultEvents));
        return;
      }

      setIsLoading(true);

      try {
        const data = await fetchStandardEvents();
        // 添加详细的调试日志
        console.group('标准事件库数据结构');
        console.log('API原始返回数据:', JSON.stringify(data, null, 2));
        console.log('数据类型:', Object.prototype.toString.call(data));
        if (Array.isArray(data)) {
          console.log('数组长度:', data.length);
          if (data.length > 0) {
            console.log('第一个事件示例:', JSON.stringify(data[0], null, 2));
            console.log('第一个事件的属性列表:', Object.keys(data[0]));
          }
        }
        console.groupEnd();

        // 确保每个事件对象都有必要的属性
        const validatedData = data.map(event => {
          const validatedEvent = {
            name: event.name || event.eventName || '未命名事件',
            description: event.description || '',
            tag: event.tag || '',
            httpUrl: event.httpUrl || '',
            httpMethod: event.httpMethod || 'get',
            params: event.params || { userid: '' }
          };

          // 记录数据转换过程
          if (event.name !== validatedEvent.name ||
            event.description !== validatedEvent.description ||
            event.tag !== validatedEvent.tag ||
            event.httpUrl !== validatedEvent.httpUrl ||
            event.httpMethod !== validatedEvent.httpMethod ||
            JSON.stringify(event.params) !== JSON.stringify(validatedEvent.params)) {
            console.log('事件数据补充:', {
              原始数据: event,
              处理后数据: validatedEvent,
              补充的字段: {
                name: event.name ? '未变更' : '已设为默认值',
                description: event.description ? '未变更' : '已设为空字符串',
                tag: event.tag ? '未变更' : '已设为空字符串',
                httpUrl: event.httpUrl ? '未变更' : '已设为空字符串',
                httpMethod: event.httpMethod ? '未变更' : '已设为get',
                params: event.params ? '未变更' : '已设为默认参数'
              }
            });
          }

          return validatedEvent;
        });

        console.log('数据验证后的结果:', JSON.stringify(validatedData, null, 2));
        setStandardEvents(validatedData);
        // 保存验证后的数据到localStorage
        localStorage.setItem('standardEvents', JSON.stringify(validatedData));
        showToast('标准事件库加载成功', 'success');
      } catch (error) {
        console.group('标准事件库加载错误');
        console.error('错误详情:', error);
        console.error('错误信息:', error.message);
        console.error('错误堆栈:', error.stack);
        if (error.response) {
          console.error('API响应状态:', error.response.status);
          console.error('API响应数据:', error.response.data);
        }
        console.groupEnd();
        setStandardEvents(defaultEvents);
        // 即使使用默认数据也要保存到localStorage
        localStorage.setItem('standardEvents', JSON.stringify(defaultEvents));
        showToast(error.message || '标准事件库加载失败，使用默认数据', 'error', 5000);
      } finally {
        setIsLoading(false);
        hasAttemptedFetch.current = true;
      }
    };

    fetchEvents();
  }, [showToast]);

  // 监听标准事件的变化，自动更新localStorage
  useEffect(() => {
    if (standardEvents.length > 0) {
      localStorage.setItem('standardEvents', JSON.stringify(standardEvents));
    }
  }, [standardEvents]);

  // 搜索过滤逻辑
  const filteredEvents = standardEvents.filter(event => {
    // 确保事件对象有 name 属性
    const eventName = event?.name || '';
    return eventName.toLowerCase().includes(searchText.toLowerCase());
  });

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
            <div key={`standard-${event.httpUrl}`}>
              <ActionButton
                text={event.name}
                title={`${event.description}${event.params ? `\n参数: ${JSON.stringify(event.params)}` : ''}`}
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