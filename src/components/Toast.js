import React from 'react';
import styles from '../styles/Bank.module.css';

const Toast = ({ message, type = 'info', visible }) => {
    if (!visible) return null;

    return (
        <div className={`${styles.toast} ${styles[`toast_${type}`]}`}>
            {message}
        </div>
    );
};

export default Toast; 