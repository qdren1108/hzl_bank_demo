import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from '../styles/Bank.module.css';

const ParameterModal = ({ isOpen, onClose, eventName, onConfirm, onSave }) => {
    // 获取事件的组成部分
    const getEventComponents = () => {
        const eventCompositions = JSON.parse(localStorage.getItem('eventCompositions') || '{}');
        const bankEvents = JSON.parse(localStorage.getItem('bankEvents') || '[]');

        // 先查找是否是银行事件
        const bankEvent = bankEvents.find(event => event.eventName === eventName);
        if (bankEvent && bankEvent.pevents) {
            return bankEvent.pevents.map(event => event.eventName);
        }

        // 如果不是银行事件，查找个人事件组合
        const savedEvent = eventCompositions[eventName];
        if (savedEvent && savedEvent.events) {
            return savedEvent.events;
        }

        return [];
    };

    // 获取保存的参数
    const getSavedParameters = () => {
        const eventCompositions = JSON.parse(localStorage.getItem('eventCompositions') || '{}');
        const savedEvent = eventCompositions[eventName];
        if (savedEvent?.parameters) {
            return savedEvent.parameters;
        }

        // 如果没有保存的参数，根据组件创建默认参数对象
        const components = getEventComponents();
        return components.reduce((acc, component) => {
            acc[component] = { usrid: '' };
            return acc;
        }, {});
    };

    // 为每个子事件设置独立的参数
    const [parameters, setParameters] = useState(getSavedParameters());
    const [components, setComponents] = useState(getEventComponents());

    // 当模态框打开时重新加载参数和组件
    useEffect(() => {
        if (isOpen) {
            const newComponents = getEventComponents();
            setComponents(newComponents);
            setParameters(getSavedParameters());
        }
    }, [isOpen, eventName]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(parameters);
        onClose();
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(eventName, parameters);
        onClose();
    };

    const handleChange = (eventName, paramName, value) => {
        setParameters(prev => ({
            ...prev,
            [eventName]: {
                ...prev[eventName],
                [paramName]: value
            }
        }));
    };

    return ReactDOM.createPortal(
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>设置事件参数</h2>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>主事件</label>
                            <input
                                type="text"
                                value={eventName}
                                disabled
                                className={styles.formInput}
                            />
                        </div>
                        {components.map((component) => (
                            <div key={component} className={styles.formGroup}>
                                <label className={styles.formLabel}>{component}参数设置</label>
                                <div className={styles.subEventParams}>
                                    <div className={styles.paramInput}>
                                        <label className={styles.formLabel}>用户ID</label>
                                        <input
                                            type="text"
                                            value={parameters[component]?.usrid || ''}
                                            onChange={(e) => handleChange(component, 'usrid', e.target.value)}
                                            className={styles.formInput}
                                            placeholder={`请输入${component}的用户ID`}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className={styles.modalFooter}>
                            <button type="button" className={`${styles.saveButton} ${styles.saveToPersonal}`} onClick={handleSave}>
                                保存
                            </button>
                            <button type="button" className={styles.cancelButton} onClick={onClose}>
                                取消
                            </button>
                            <button type="submit" className={styles.saveButton}>
                                确认
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ParameterModal; 