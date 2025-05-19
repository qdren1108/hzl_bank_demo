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
  const [standardEvents, setStandardEvents] = useState([]);

  // 初始化编辑状态
  useEffect(() => {
    if (initialEvent) {
      setEventName(initialEvent.name || '');
      setEventDescription(initialEvent.description || '');
      setSelectedEvents(Array.isArray(initialEvent.events)
        ? initialEvent.events.map(event =>
          typeof event === 'object' ? event : { name: event }
        )
        : []);
    } else {
      setEventName('');
      setEventDescription('');
      setSelectedEvents([]);
    }
  }, [initialEvent, isOpen]);

  // 从localStorage加载标准事件
  useEffect(() => {
    if (eventType === '标准事件') {
      const savedStandardEvents = JSON.parse(localStorage.getItem('standardEvents') || '[]');
      console.log('从localStorage加载的标准事件:', savedStandardEvents);
      setStandardEvents(savedStandardEvents);
    }
  }, [eventType, isOpen]);

  // 过滤可用事件，排除已选择的事件
  const filteredAvailableEvents = (eventType === '标准事件' ? standardEvents : availableEvents)
    .filter(event => {
      const eventNameStr = typeof event === 'string' ? event : event.name;
      return (!searchQuery || eventNameStr.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !selectedEvents.some(sel => sel.name === eventNameStr);
    });

  // 当Modal打开时，初始化拖拽功能
  useEffect(() => {
    if (isOpen) {
      const selectedEventsEl = document.getElementById('selectedEvents');
      if (selectedEventsEl) {
        new Sortable(selectedEventsEl, {
          animation: 150,
          onSort: (evt) => {
            const newSelectedEvents = Array.from(selectedEventsEl.children).map(
              node => node.textContent
            );
            setSelectedEvents(newSelectedEvents.map(event =>
              typeof event === 'string' ? { name: event } : event
            ));
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
    setSearchQuery(e.target.value);
    setShowAvailableEvents(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowAvailableEvents(false);
    }, 200);
  };

  const handleSearchFocus = () => {
    setShowAvailableEvents(true);
  };

  const handleEventSelect = (event) => {
    const eventObj = typeof event === 'string'
      ? { name: event }
      : event;
    setSelectedEvents([...selectedEvents, eventObj]);
    setSearchQuery('');
    setShowAvailableEvents(false);
  };

  const handleRemoveEvent = (eventToRemove) => {
    setSelectedEvents(selectedEvents.filter(event => event.name !== (eventToRemove.name || eventToRemove)));
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
                      {typeof event === 'string' ? event : event.name}
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
                    <span className={styles.eventText}>{event.name}</span>
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