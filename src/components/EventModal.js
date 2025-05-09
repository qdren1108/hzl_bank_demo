import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Sortable from 'sortablejs';
import styles from '../styles/Bank.module.css';
import ActionButton from './ActionButton';

const EventModal = ({ isOpen, onClose, title, nameLabel, eventType, availableEvents, onSave, initialEvent = null }) => {
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAvailableEvents, setShowAvailableEvents] = useState(false);

  // 初始化编辑状态
  useEffect(() => {
    if (initialEvent) {
      setEventName(initialEvent.name || '');
      setEventDescription(initialEvent.description || '');
      // 确保 selectedEvents 是字符串数组
      setSelectedEvents(Array.isArray(initialEvent.events)
        ? initialEvent.events.map(event =>
          typeof event === 'object' ? event.eventName : event
        )
        : []);
    } else {
      setEventName('');
      setEventDescription('');
      setSelectedEvents([]);
    }
  }, [initialEvent, isOpen]);

  // 过滤可用事件，排除已选择的事件
  const filteredAvailableEvents = availableEvents.filter(event =>
    (typeof event === 'string' ? event : event.eventName).toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedEvents.includes(typeof event === 'string' ? event : event.eventName)
  );

  // 当Modal打开时，初始化拖拽功能
  useEffect(() => {
    if (isOpen) {
      // 已选事件列表
      const selectedEventsEl = document.getElementById('selectedEvents');

      if (selectedEventsEl) {
        // 初始化已选事件列表的拖拽
        new Sortable(selectedEventsEl, {
          animation: 150,
          onSort: (evt) => {
            // 更新已选事件列表
            const newSelectedEvents = Array.from(selectedEventsEl.children).map(
              node => node.textContent
            );
            setSelectedEvents(newSelectedEvents);
          }
        });
      }
    }
  }, [isOpen]);

  const handleNameChange = (e) => {
    setEventName(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setEventDescription(e.target.value);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowAvailableEvents(true);
  };

  const handleSearchBlur = () => {
    // 延迟隐藏下拉列表，以便用户能够点击选项
    setTimeout(() => {
      setShowAvailableEvents(false);
    }, 200);
  };

  const handleSearchFocus = () => {
    setShowAvailableEvents(true);
  };

  const handleEventSelect = (event) => {
    const eventName = typeof event === 'string' ? event : event.eventName;
    setSelectedEvents([...selectedEvents, eventName]);
    setSearchQuery('');
    setShowAvailableEvents(false);
  };

  const handleRemoveEvent = (eventToRemove) => {
    setSelectedEvents(selectedEvents.filter(event => event !== eventToRemove));
  };

  const handleSave = () => {
    if (!eventName.trim()) {
      alert('请输入事件名称');
      return;
    }

    onSave({
      name: eventName,
      description: eventDescription,
      events: selectedEvents
    });

    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>{nameLabel}</label>
            <input
              type="text"
              value={eventName}
              onChange={handleNameChange}
              className={styles.formInput}
              placeholder={`请输入${nameLabel}`}
            />
          </div>

          {eventType === '标准事件' && (
            <div className={styles.formGroup}>
              <label>事件描述</label>
              <textarea
                value={eventDescription}
                onChange={handleDescriptionChange}
                className={styles.formInput}
                placeholder="请输入事件描述"
                rows="3"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>{eventType}选择</label>
            <div className={styles.searchContainer}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className={styles.searchInput}
                placeholder={`搜索${eventType}`}
              />
            </div>

            {showAvailableEvents && (
              <div className={styles.eventsDropdown}>
                {filteredAvailableEvents.length > 0 ? (
                  filteredAvailableEvents.map((event, index) => (
                    <div
                      key={index}
                      className={styles.eventItem}
                      onClick={() => handleEventSelect(event)}
                    >
                      {typeof event === 'string' ? event : event.eventName}
                    </div>
                  ))
                ) : (
                  <div className={styles.noEvents}>
                    {searchQuery ? '没有找到匹配的事件' : '没有可用的事件'}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>已选择的{eventType}</label>
            <div id="selectedEvents" className={styles.selectedEvents}>
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event, index) => (
                  <div key={index} className={styles.selectedEventItem}>
                    <span className={styles.eventText}>{event}</span>
                    <button
                      className={styles.removeEventBtn}
                      onClick={() => handleRemoveEvent(event)}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.noSelectedEvents}>
                  请从上方选择{eventType}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            取消
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EventModal; 