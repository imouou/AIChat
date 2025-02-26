const axios = require('axios');

const config = require('../config/config');

// 如果使用官方的api，model 需要更改为 deepseek-chat
// 如果使用腾讯云的api，model 需要更改为 deepseek-r1
var baseUrl = config.baseURL;

class DeepSeekClient {
    constructor(apiKey, baseURL = baseUrl) {
        this.apiKey = apiKey;
        this.baseURL = baseURL;
    }

    async createChatCompletion({ messages, model = config.model, stream = config.stream, ...options }) {
        try {
            const response = await axios({
                method: 'POST',
                url: `${this.baseURL}/chat/completions`,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    model,
                    messages,
                    stream,
                    ...options
                },
                responseType: stream ? 'stream' : 'json'
            });

            if (!stream) {
                return response.data;
            }

            // 处理流式响应
            return new ReadableStream({
                start(controller) {
                    let buffer = '';
                    let isDone = false;  // 添加标志来追踪是否已经结束

                    response.data.on('data', (chunk) => {
                        const lines = chunk.toString().split('\n');
                        
                        lines.forEach(line => {
                            if (line.trim() === '') return;
                            if (line.trim() === 'data: [DONE]') {
                                if (!isDone) {  // 确保只关闭一次
                                    isDone = true;
                                    controller.close();
                                }
                                return;
                            }

                            try {
                                const data = JSON.parse(line.replace('data: ', ''));
                                if (data.choices[0].delta?.content) {
                                    controller.enqueue(data.choices[0].delta.content);
                                }
                            } catch (e) {
                                console.error('Error parsing chunk:', e);
                            }
                        });
                    });

                    response.data.on('end', () => {
                        if (!isDone) {  // 只有在还没有关闭的情况下才关闭
                            controller.close();
                        }
                    });

                    response.data.on('error', (err) => {
                        controller.error(err);
                    });
                }
            });
        } catch (error) {
            throw new Error(`DeepSeek API request failed: ${error.message}`);
        }
    }
}

module.exports = DeepSeekClient;