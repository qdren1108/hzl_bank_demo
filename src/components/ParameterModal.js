import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from '../styles/Bank.module.css';

const ParameterModal = ({ isOpen, onClose, eventName, onConfirm }) => {
    // 为每个子事件设置独立的参数
    const [parameters, setParameters] = useState({
        OTP検索: {
            usrid: ''
        },
        OTP更新: {
            usrid: ''
        }
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(parameters);
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
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>OTP検索参数设置</label>
                            <div className={styles.subEventParams}>
                                <div className={styles.paramInput}>
                                    <label className={styles.formLabel}>用户ID</label>
                                    <input
                                        type="text"
                                        value={parameters['OTP検索'].usrid}
                                        onChange={(e) => handleChange('OTP検索', 'usrid', e.target.value)}
                                        className={styles.formInput}
                                        placeholder="请输入OTP検索的用户ID"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>OTP更新参数设置</label>
                            <div className={styles.subEventParams}>
                                <div className={styles.paramInput}>
                                    <label className={styles.formLabel}>用户ID</label>
                                    <input
                                        type="text"
                                        value={parameters['OTP更新'].usrid}
                                        onChange={(e) => handleChange('OTP更新', 'usrid', e.target.value)}
                                        className={styles.formInput}
                                        placeholder="请输入OTP更新的用户ID"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
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