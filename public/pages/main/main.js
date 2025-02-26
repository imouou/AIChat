loader.define(function(requires,exports,module,global){

    // 合并接收默认参数
    let props = $.extend(true, {}, module.props);

    var chatComp = null;
    // 初始化数据行为存储
    var bs = bui.store({
        el: `#${module.id}`,
        scope: "page",
        data: {
           url: "http://localhost:3000/api/chat",
        //    url: "http://localhost:3000/api/chatdeepseek",
        },
        methods: {},
        watch: {},
        computed: {},
        templates: {},
        mounted: async function(){
            // 数据解析后执行
            let _bs = this;

            chatComp = await loader.load({
                id:"#chatWithDeepseek",
                url:"components/chat/index.html", 
                param: {
                    title:"Deepseek",
                    async onSubmit(){
                        
                        // 发送请求
                        let _chat = this;
                        let val = _chat.value;
                        try {

                            let gid = bui.guid();
                            _chat.addChatTarget({
                                content: "waiting...",
                                avatar:"images/deepseek.png",
                                id: gid
                            })

                            const response = await fetch(_bs.url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    messages: [
                                        { role: 'user', content: val }
                                    ]
                                })
                            });

                            
                            const reader = response.body.getReader();
                            const decoder = new TextDecoder();

                            let content = "";

                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) break;
                                
                                // 解码二进制数据
                                const chunk = decoder.decode(value);
                                
                                // 处理SSE格式的数据
                                const lines = chunk.split('\n');
                                lines.forEach(line => {
                                    if (line.startsWith('data: ')) {
                                        const data = line.slice(6); // 移除 'data: ' 前缀
                                        if (data === '[DONE]') {
                                            console.log('Stream completed');
                                            // 只替换数据，不替换html
                                            _chat.replaceChatTarget({
                                                content: marked.parse(content),
                                                avatar:"images/deepseek.png",
                                                id: gid
                                            });
                                            // 2. 执行 mathjax 渲染
                                            MathJax.typeset();
                                            return;
                                        }
                                        
                                        try {
                                            const parsed = JSON.parse(data);
                                            // 将内容添加到页面
                                            content += parsed.content;
                                            // 更新DOM
                                            router.$(`#${gid} .chat-content`).html(marked.parse(content));
                                            // 2. 执行 mathjax 渲染
                                            MathJax.typeset();
                                        } catch (e) {
                                            console.error('Error parsing JSON:', e);
                                        }
                                    }
                                });
                            }
                        } catch (error) {
                            console.error('Error:', error);
                        }

                    }
                }
            });
        }
    })
})