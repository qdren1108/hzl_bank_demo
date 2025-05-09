import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Bank.module.css';
import ActionButton from './ActionButton';
import EventModal from './EventModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const EventsSection = () => {
  const [personalEvents, setPersonalEvents] = useState([]);
  const [bankEvents, setBankEvents] = useState([]);
  const [searchPersonalText, setSearchPersonalText] = useState('');
  const [searchBankText, setSearchBankText] = useState('');
  const [showPersonalSearch, setShowPersonalSearch] = useState(false);
  const [showBankSearch, setShowBankSearch] = useState(false);
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isPersonalEditModalOpen, setIsPersonalEditModalOpen] = useState(false);
  const [isBankEditModalOpen, setIsBankEditModalOpen] = useState(false);
  const [isPersonalDeleteModalOpen, setIsPersonalDeleteModalOpen] = useState(false);
  const [isBankDeleteModalOpen, setIsBankDeleteModalOpen] = useState(false);
  const [currentEditEvent, setCurrentEditEvent] = useState(null);
  const [currentDeleteEvent, setCurrentDeleteEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasAttemptedFetch = useRef(false);

  // 默认银行事件数据
  const defaultBankEvents = [
    {
      id: 1,
      eventName: "OTP開始",
      description: "ユーザOTP開始",
      pevents: [
        {
          id: 1,
          eventName: "OTP検索",
          description: "ユーザOTP検索",
          parameters: "usrid",
          pevents: "/bank/transfer"
        },
        {
          id: 2,
          eventName: "OTP更新",
          description: "ユーザOTP更新",
          parameters: "usrid",
          pevents: "/bank/transfer"
        }
      ]
    }
  ];

  // 从API获取银行事件数据
  useEffect(() => {
    const fetchBankEvents = async () => {
      // 如果已经尝试过获取数据，直接使用默认数据
      if (hasAttemptedFetch.current) {
        setBankEvents(defaultBankEvents);
        return;
      }

      setIsLoading(true);

      try {
        // 创建一个超时Promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('请求超时')), 3000);
        });

        // 创建实际的API请求Promise
        const fetchPromise = fetch('http://9.197.76.157:8080/api/events/bank');

        // 使用Promise.race来竞争，谁先完成就用谁的结果
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (!response.ok) {
          throw new Error('API请求失败');
        }

        const data = await response.json();
        setBankEvents(data);
      } catch (err) {
        // 静默失败，直接使用默认数据
        setBankEvents(defaultBankEvents);
      } finally {
        setIsLoading(false);
        hasAttemptedFetch.current = true;
      }
    };

    fetchBankEvents();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 保存事件组合信息（事件名称到组成它的事件的映射）
  const [eventCompositions, setEventCompositions] = useState({});

  // 从本地存储加载事件列表和组合信息
  useEffect(() => {
    const savedPersonalEvents = localStorage.getItem('personalEvents');
    const savedEventCompositions = localStorage.getItem('eventCompositions');

    if (savedPersonalEvents) {
      setPersonalEvents(JSON.parse(savedPersonalEvents));
    }
    if (savedEventCompositions) {
      setEventCompositions(JSON.parse(savedEventCompositions));
    }
  }, []);

  // 保存事件到本地存储
  const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // 搜索过滤逻辑
  const filteredPersonalEvents = personalEvents.filter(event =>
    event.toLowerCase().includes(searchPersonalText.toLowerCase())
  );

  const filteredBankEvents = bankEvents.filter(event =>
    event.eventName.toLowerCase().includes(searchBankText.toLowerCase())
  );

  // 搜索相关处理函数
  const handlePersonalSearch = (e) => {
    setSearchPersonalText(e.target.value);
  };

  const handleBankSearch = (e) => {
    setSearchBankText(e.target.value);
  };

  const togglePersonalSearch = () => {
    setShowPersonalSearch(!showPersonalSearch);
    if (showPersonalSearch) {
      setSearchPersonalText('');
    }
  };

  const toggleBankSearch = () => {
    setShowBankSearch(!showBankSearch);
    if (showBankSearch) {
      setSearchBankText('');
    }
  };

  // Modal相关处理函数
  const openPersonalModal = () => {
    setIsPersonalModalOpen(true);
  };

  const closePersonalModal = () => {
    setIsPersonalModalOpen(false);
  };

  const openBankModal = () => {
    setIsBankModalOpen(true);
  };

  const closeBankModal = () => {
    setIsBankModalOpen(false);
  };

  // 编辑功能相关处理函数
  const openPersonalEditModal = (eventName) => {
    const composition = eventCompositions[eventName] || { events: [], parameters: "" };
    setCurrentEditEvent({
      name: eventName,
      events: Array.isArray(composition.events) ? composition.events : [],
      parameters: composition.parameters || ""
    });
    setIsPersonalEditModalOpen(true);
  };

  const closePersonalEditModal = () => {
    setCurrentEditEvent(null);
    setIsPersonalEditModalOpen(false);
  };

  const openBankEditModal = (eventName) => {
    const bankEvent = bankEvents.find(event => event.eventName === eventName);
    if (bankEvent) {
      setCurrentEditEvent({
        name: eventName,
        description: bankEvent.description || "",
        events: bankEvent.pevents ? bankEvent.pevents.map(event => ({
          id: event.id,
          eventName: event.eventName,
          description: event.description,
          parameters: event.parameters,
          pevents: event.pevents
        })) : [],
        parameters: bankEvent.pevents?.map(e => e.parameters).join(", ") || ""
      });
    }
    setIsBankEditModalOpen(true);
  };

  const closeBankEditModal = () => {
    setCurrentEditEvent(null);
    setIsBankEditModalOpen(false);
  };

  // 删除功能相关处理函数
  const openPersonalDeleteModal = (eventName) => {
    setCurrentDeleteEvent({
      name: eventName,
      events: eventCompositions[eventName] || []
    });
    setIsPersonalDeleteModalOpen(true);
  };

  const closePersonalDeleteModal = () => {
    setCurrentDeleteEvent(null);
    setIsPersonalDeleteModalOpen(false);
  };

  const openBankDeleteModal = (eventName) => {
    setCurrentDeleteEvent({
      name: eventName,
      events: eventCompositions[eventName] || []
    });
    setIsBankDeleteModalOpen(true);
  };

  const closeBankDeleteModal = () => {
    setCurrentDeleteEvent(null);
    setIsBankDeleteModalOpen(false);
  };

  // 删除事件处理函数
  const handleDeletePersonalEvent = (eventName) => {
    const newEvents = personalEvents.filter(event => event !== eventName);
    setPersonalEvents(newEvents);
    saveToLocalStorage('personalEvents', newEvents);

    // 删除组合信息
    const newCompositions = { ...eventCompositions };
    delete newCompositions[eventName];
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);
  };

  const handleDeleteBankEvent = (eventName) => {
    // 检查是否有个人事件使用了这个银行事件
    const dependentEvents = Object.entries(eventCompositions)
      .filter(([key, events]) =>
        personalEvents.includes(key) && events.events.includes(eventName)
      )
      .map(([key]) => key);

    if (dependentEvents.length > 0) {
      alert(`不能删除此银行事件，因为以下个人事件依赖它：\n${dependentEvents.join('\n')}`);
      return;
    }

    const newEvents = bankEvents.filter(event => event.eventName !== eventName);
    setBankEvents(newEvents);
    saveToLocalStorage('bankEvents', newEvents);

    // 删除组合信息
    const newCompositions = { ...eventCompositions };
    delete newCompositions[eventName];
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);
  };

  // 保存新事件
  const handleSavePersonalEvent = (eventData) => {
    // 如果事件名已存在，不添加新事件
    if (personalEvents.includes(eventData.name)) {
      alert(`个人事件 "${eventData.name}" 已存在`);
      return;
    }

    const newEvents = [...personalEvents, eventData.name];
    setPersonalEvents(newEvents);
    saveToLocalStorage('personalEvents', newEvents);

    // 保存事件组合信息
    const newCompositions = {
      ...eventCompositions,
      [eventData.name]: {
        events: Array.isArray(eventData.events) ? eventData.events : [],
        parameters: eventData.parameters || ""
      }
    };
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);
  };

  const handleSaveBankEvent = (eventData) => {
    // 如果事件名已存在，不添加新事件
    if (bankEvents.some(event => event.eventName === eventData.name)) {
      alert(`银行事件 "${eventData.name}" 已存在`);
      return;
    }

    const newEvent = {
      id: bankEvents.length + 1,
      eventName: eventData.name,
      description: eventData.description || "",
      pevents: Array.isArray(eventData.events) ? eventData.events.map(event => ({
        id: event.id || bankEvents.length + 1,
        eventName: event.eventName || "",
        description: event.description || "",
        parameters: event.parameters || "",
        pevents: event.pevents || ""
      })) : []
    };

    const newEvents = [...bankEvents, newEvent];
    setBankEvents(newEvents);
    saveToLocalStorage('bankEvents', newEvents);

    // 保存事件组合信息
    const newCompositions = {
      ...eventCompositions,
      [eventData.name]: {
        events: Array.isArray(eventData.events) ? eventData.events : [],
        parameters: eventData.parameters || ""
      }
    };
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);
  };

  // 保存编辑后的事件
  const handleUpdatePersonalEvent = (eventData) => {
    const oldName = currentEditEvent.name;
    const newName = eventData.name;

    // 更新事件名称（如果有变化）
    if (oldName !== newName) {
      // 删除旧事件，添加新事件
      const index = personalEvents.indexOf(oldName);
      if (index !== -1) {
        const newEvents = [...personalEvents];
        newEvents.splice(index, 1, newName);
        setPersonalEvents(newEvents);
        saveToLocalStorage('personalEvents', newEvents);
      }
    }

    // 更新事件组合信息
    const newCompositions = { ...eventCompositions };
    // 删除旧事件的组合
    if (oldName !== newName) {
      delete newCompositions[oldName];
    }
    // 添加新事件的组合
    newCompositions[newName] = {
      events: Array.isArray(eventData.events) ? eventData.events : [],
      parameters: eventData.parameters || ""
    };
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);

    closePersonalEditModal();
  };

  const handleUpdateBankEvent = (eventData) => {
    const oldName = currentEditEvent.name;
    const newName = eventData.name;

    // 更新事件名称（如果有变化）
    if (oldName !== newName) {
      // 删除旧事件，添加新事件
      const index = bankEvents.findIndex(event => event.eventName === oldName);
      if (index !== -1) {
        const newEvents = [...bankEvents];
        newEvents.splice(index, 1, {
          ...newEvents[index],
          eventName: newName,
          description: eventData.description || "",
          pevents: Array.isArray(eventData.events) ? eventData.events.map(event => ({
            id: event.id || bankEvents.length + 1,
            eventName: event.eventName || "",
            description: event.description || "",
            parameters: event.parameters || "",
            pevents: event.pevents || ""
          })) : []
        });
        setBankEvents(newEvents);
        saveToLocalStorage('bankEvents', newEvents);
      }

      // 更新引用这个银行事件的个人事件
      const newCompositions = { ...eventCompositions };
      Object.keys(newCompositions).forEach(eventName => {
        if (personalEvents.includes(eventName)) {
          const events = newCompositions[eventName].events;
          const eventIndex = events.indexOf(oldName);
          if (eventIndex !== -1) {
            events[eventIndex] = newName;
          }
        }
      });

      setEventCompositions(newCompositions);
      saveToLocalStorage('eventCompositions', newCompositions);
    } else {
      // 只更新描述和事件组合
      const index = bankEvents.findIndex(event => event.eventName === oldName);
      if (index !== -1) {
        const newEvents = [...bankEvents];
        newEvents[index] = {
          ...newEvents[index],
          description: eventData.description || "",
          pevents: Array.isArray(eventData.events) ? eventData.events.map(event => ({
            id: event.id || bankEvents.length + 1,
            eventName: event.eventName || "",
            description: event.description || "",
            parameters: event.parameters || "",
            pevents: event.pevents || ""
          })) : []
        };
        setBankEvents(newEvents);
        saveToLocalStorage('bankEvents', newEvents);
      }
    }

    // 更新事件组合信息
    const newCompositions = { ...eventCompositions };
    // 删除旧事件的组合
    if (oldName !== newName) {
      delete newCompositions[oldName];
    }
    // 添加新事件的组合
    newCompositions[newName] = {
      events: Array.isArray(eventData.events) ? eventData.events : [],
      parameters: eventData.parameters || ""
    };
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);

    closeBankEditModal();
  };

  // 显示事件的详细信息（组成它的事件）
  const getEventDescription = (eventName) => {
    const bankEvent = bankEvents.find(event => event.eventName === eventName);
    if (bankEvent) {
      return `${bankEvent.description}${bankEvent.pevents ? `\n包含事件: ${bankEvent.pevents.map(e => `${e.eventName}(${e.parameters})`).join(', ')}` : ''}`;
    }
    const composition = eventCompositions[eventName];
    if (composition?.events && composition.events.length > 0) {
      return `由 ${composition.events.join('、')} 组成`;
    }
    return '';
  };

  return (
    <div className={styles.section} id="eventsSection">
      <div className={styles.sectionTitle}>
        <div className={styles.sectionTitleText}>个人事件库</div>
        <div className={styles.titleActions}>
          <button
            className={styles.actionIcon}
            onClick={togglePersonalSearch}
            title={showPersonalSearch ? "关闭搜索" : "搜索"}
          >
            🔍
          </button>
          <button
            className={styles.actionIcon}
            onClick={openPersonalModal}
            title="添加个人事件"
          >
            ➕
          </button>
        </div>
      </div>

      {showPersonalSearch && (
        <input
          type="text"
          className={styles.searchBox}
          placeholder="🔍 搜索个人事件"
          value={searchPersonalText}
          onChange={handlePersonalSearch}
          autoFocus
        />
      )}

      <div className={styles.buttonContainer} id="personalEvents">
        {filteredPersonalEvents.map((event, index) => (
          <div key={`personal-${index}`} className={styles.eventWithActions}>
            <ActionButton
              text={event}
              title={getEventDescription(event)}
            />
            <div className={styles.eventActions}>
              <button
                className={styles.editButton}
                onClick={() => openPersonalEditModal(event)}
                title="编辑"
              >
                ✏️
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => openPersonalDeleteModal(event)}
                title="删除"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.sectionTitle}>
        <div className={styles.sectionTitleText}>银行事件库</div>
        <div className={styles.titleActions}>
          <button
            className={styles.actionIcon}
            onClick={toggleBankSearch}
            title={showBankSearch ? "关闭搜索" : "搜索"}
          >
            🔍
          </button>
          <button
            className={styles.actionIcon}
            onClick={openBankModal}
            title="添加银行事件"
          >
            ➕
          </button>
        </div>
      </div>

      {showBankSearch && (
        <input
          type="text"
          className={styles.searchBox}
          placeholder="🔍 搜索银行事件"
          value={searchBankText}
          onChange={handleBankSearch}
          autoFocus
        />
      )}

      <div className={styles.buttonContainer} id="bankEvents">
        {isLoading ? (
          <div className={styles.loading}>加载中...</div>
        ) : (
          filteredBankEvents.map((event) => (
            <div key={`bank-${event.id}`} className={styles.eventWithActions}>
              <ActionButton
                text={event.eventName}
                title={getEventDescription(event.eventName)}
              />
              <div className={styles.eventActions}>
                <button
                  className={styles.editButton}
                  onClick={() => openBankEditModal(event.eventName)}
                  title="编辑"
                >
                  ✏️
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => openBankDeleteModal(event.eventName)}
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 个人事件创建Modal */}
      <EventModal
        isOpen={isPersonalModalOpen}
        onClose={closePersonalModal}
        title="创建个人事件"
        nameLabel="个人事件名"
        eventType="银行事件"
        availableEvents={bankEvents.map(event => event.eventName)}
        onSave={handleSavePersonalEvent}
      />

      {/* 银行事件创建Modal */}
      <EventModal
        isOpen={isBankModalOpen}
        onClose={closeBankModal}
        title="创建银行事件"
        nameLabel="银行事件名"
        eventType="标准事件"
        availableEvents={[]} // 这里需要从标准事件库获取
        onSave={handleSaveBankEvent}
      />

      {/* 个人事件编辑Modal */}
      <EventModal
        isOpen={isPersonalEditModalOpen}
        onClose={closePersonalEditModal}
        title="编辑个人事件"
        nameLabel="个人事件名"
        eventType="银行事件"
        availableEvents={bankEvents.map(event => event.eventName)}
        onSave={handleUpdatePersonalEvent}
        initialEvent={currentEditEvent}
      />

      {/* 银行事件编辑Modal */}
      <EventModal
        isOpen={isBankEditModalOpen}
        onClose={closeBankEditModal}
        title="编辑银行事件"
        nameLabel="银行事件名"
        eventType="标准事件"
        availableEvents={[]} // 这里需要从标准事件库获取
        onSave={handleUpdateBankEvent}
        initialEvent={currentEditEvent}
      />

      {/* 个人事件删除确认Modal */}
      <DeleteConfirmModal
        isOpen={isPersonalDeleteModalOpen}
        onClose={closePersonalDeleteModal}
        onConfirm={handleDeletePersonalEvent}
        title="删除个人事件"
        eventName={currentDeleteEvent?.name}
        composition={currentDeleteEvent?.events}
      />

      {/* 银行事件删除确认Modal */}
      <DeleteConfirmModal
        isOpen={isBankDeleteModalOpen}
        onClose={closeBankDeleteModal}
        onConfirm={handleDeleteBankEvent}
        title="删除银行事件"
        eventName={currentDeleteEvent?.name}
        composition={currentDeleteEvent?.events}
      />
    </div>
  );
};

export default EventsSection;