// 自定义流式输出方法，一般采用openai的通用方法即可
var express = require('express');
var router = express.Router();

const config = require('../config/config');
const DeepSeekClient = require('./deepseek');
// 使用配置的apikey
const deepseek = new DeepSeekClient(config.apiKey);

// 创建流式聊天接口
// http://localhost:3000/api/chatdeepseek
router.post('/chatdeepseek', async (req, res) => {
    try {
        const { messages } = req.body;
        
        // 设置响应头，支持流式输出和CORS
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // 获取流式响应
        const stream = await deepseek.createChatCompletion({
            model: config.model || "deepseek-r1", // 此处以 deepseek-r1 为例，可按需更换模型名称
            messages,
            stream: config.stream,
            temperature: config.temperature,
            max_tokens: config.max_tokens,
        });

        // 读取流并发送到客户端
        const reader = stream.getReader();
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                res.write('data: [DONE]\n\n');
                res.end();
                break;
            }
            
            // 发送数据到客户端
            res.write(`data: ${JSON.stringify({ content: value })}\n\n`);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;