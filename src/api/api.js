// 事件执行API
export async function executeEventApi(requestBody) {
    console.log('请求体:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await fetch('http://9.197.76.157:8080/api/events/todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            throw new Error('事件执行请求失败');
        }
        const result = await response.json();
        console.log('事件执行成功，服务器响应:', JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error('事件执行错误:', error);
        throw error;
    }
} 