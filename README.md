# AIChat Deepseek 聊天

## 简介

基于Express + BUI 制作的deepseek API 聊天服务，便于定制自己的聊天机器人，支持deepseek 官方api 和 腾讯云api

## 配置APIKey

在`config/config.js`中配置APIKey.

- deepseek 官方api 如何获取API Key：https://platform.deepseek.com/
- 腾讯云 Deepseek api 如何获取API Key：https://cloud.tencent.com/document/product/1551/79622

```js
{
    apiKey: "sk-xxxxx", 
    baseURL: "https://api.lkeap.cloud.tencent.com/v1",
    model: "deepseek-r1", 
    stream: true,   
    temperature: 0.6,
    max_tokens: 1000,
}
```

## model的配置说明

- 当baseUrl 为官方时，model: "deepseek-chat", //  deepseek-chat（等于v3） || deepseek-reasoner (等于r1)
- 当baseUrl 为腾讯云时，model: "deepseek-r1", //  deepseek-r1 || deepseek-v3 


## 安装

```bash
# 安装依赖
npm i
# 启动
npm run start
```

访问： http://localhost:3000


## 依赖

- Express 
- BUI 
- Marked
- Mathjax
- openai