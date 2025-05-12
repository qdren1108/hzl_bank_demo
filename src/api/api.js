// 通用的API请求处理函数
async function makeRequest(url, options = {}, timeoutMs = 10000) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API请求错误:', error);
        if (error.name === 'AbortError') {
            throw new Error('请求超时，请检查服务器状态或网络连接');
        } else if (!navigator.onLine) {
            throw new Error('网络连接已断开，请检查网络设置');
        } else {
            throw new Error(`请求失败: ${error.message}`);
        }
    }
}

// 事件执行API
export async function executeEventApi(requestBody) {
    console.log('请求体:', JSON.stringify(requestBody, null, 2));
    return makeRequest('http://9.197.76.157:8080/api/events/todo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });
}

// 获取标准事件库
export async function fetchStandardEvents() {
    return makeRequest('http://9.197.76.157:8080/api/events/standard');
}

// 获取银行事件库
export async function fetchBankEvents() {
    return makeRequest('http://9.197.76.157:8080/api/events/bank');
}

// 获取个人事件库
export async function fetchPersonalEvents() {
    return makeRequest('http://9.197.76.157:8080/api/events/personal');
}

// 添加银行事件（通过标准事件）
export async function addBankEventFromStandard(data) {
    console.log('添加银行事件API请求体:', JSON.stringify(data, null, 2));
    return makeRequest('http://9.197.76.157:8080/api/events/bank/from-standard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

// 添加个人事件（通过银行事件）
export async function addPersonalEventFromBank(data) {
    return makeRequest('http://9.197.76.157:8080/api/events/personal/from-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

// 删除银行事件
export async function deleteBankEvent(id) {
    return makeRequest(`http://9.197.76.157:8080/api/events/bank/${id}`, {
        method: 'DELETE'
    });
}

// 删除个人事件
export async function deletePersonalEvent(id) {
    return makeRequest(`http://9.197.76.157:8080/api/events/personal/${id}`, {
        method: 'DELETE'
    });
} 