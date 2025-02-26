// 用openai模块的通用做法
var express = require('express');
var router = express.Router();
var OpenAI = require("openai");
// 获取基本配置
const config = require('../config/config');

const openai = new OpenAI(
    {
        apiKey: config.apiKey,
        baseURL: config.baseURL
    }
);

// 思考并进行输出
async function think(req,res,next) {

    const { messages, model, stream } = req.body;

    let isAnswering = false; // 判断是否结束思考过程并开始回复

    // 确保messages是数组格式
    const messageArray = Array.isArray(messages) ? messages : [{
        role: "user",
        content: messages
    }];

    const completion = await openai.chat.completions.create({
        model: model || config.model || "deepseek-r1", // 此处以 deepseek-r1 为例，可按需更换模型名称
        messages: messageArray,
        stream: config.stream,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
    });

    let thinkingContent = "\n" + "=".repeat(8) + "思考过程" + "=".repeat(8) + "\n"; // 定义完整思考过程
    
    res.write(`data: ${JSON.stringify({ content: thinkingContent })}\n\n`);

    for await (const chunk of completion) {
        // 处理usage信息
        if (!chunk.choices?.length) {
            console.log("\n" + "=".repeat(8) + "Token 使用情况" + "=".repeat(8) + "\n");
            console.log(chunk.usage);
            continue;
        }

        const delta = chunk?.choices?.[0]?.delta;

        // 处理空内容情况
        if (!delta.reasoning_content && !delta.content) {
            continue;
        }

        // 处理思考后开始回答的情况
        if (!delta.reasoning_content && !isAnswering) {
            let thinkSplit = "\n" + "=".repeat(8) + "完整回复" + "=".repeat(8) + "\n";
            res.write(`data: ${JSON.stringify({ content: thinkSplit })}\n\n`);

            isAnswering = true;
        }

        // 处理思考过程
        if (delta.reasoning_content) {
            process.stdout.write(delta.reasoning_content);
            res.write(`data: ${JSON.stringify({ content: delta.reasoning_content })}\n\n`);
        }
        // 处理回复内容
        else if (delta.content) {
            process.stdout.write(delta.content);
            res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);

        }
    }
}

// 创建流式聊天接口
router.post('/chat', async (req, res, next) => {
    try {

        // 设置 SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // 等待思考过程
        await think(req, res, next).catch(console.error);

        // 发送结束信号
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
