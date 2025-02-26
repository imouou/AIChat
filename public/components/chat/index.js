// 聊天组件

loader.define(function(require,exports,module,global) {
    
    // 合并接收默认参数
    let props = $.extend(true, {
        onSubmit:null,
        value:"",
        title:"聊天",
    }, module.props);


    // 初始化数据行为存储
    var bs = bui.store({
        el: `#${module.id}`,
        scope: "chat",
        data: {
            title: props.title,
           value: props.value,
           content:[],
           canSubmit: {
            disabled: false,
           }
        },
        methods: {
            submit(e) {
                var val = this.value;
                
                if( !val ){
                    return false;
                }
                
                // 新增聊天数据
                this.content.push({
                    content: this.value,
                    avatar: "images/applogo.png",
                    createTime: bui.date.today('yyyy-MM-dd hh:mm:ss'),
                    target: false
                })

                props?.onSubmit?.call(this,this.value);

                this.value = "";
            },
            addChatTarget(opt){
                // addChatTarget({ content:"",avatar,createTime})

                var opts = $.extend(true,{
                    content: "",
                    avatar: "images/applogo.png",
                    createTime: bui.date.today('yyyy-MM-dd hh:mm:ss'),
                    target: true
                },opt);
                // 新增聊天数据
                this.content.push(opts);

            },
            replaceChatTarget(opt){
                // addChatTarget({ content:"",avatar,createTime})

                var opts = $.extend(true,{
                    content: "",
                    avatar: "images/applogo.png",
                    createTime: bui.date.today('yyyy-MM-dd hh:mm:ss'),
                    target: true
                },opt);

                // 新增聊天数据
                this.content.splice(this.content.length-1,1,opts);

                console.log(this.content)
            }
        },
        watch: {},
        computed: {
            disabled(){
                return this.value ? false : true;
            }
        },
        templates: {
            chatMine(item){
                // 我的聊天
                return `<div class="chat-line">
                            <div class="bui-box-center">
                                <div class="time">${ item.createTime || ""}</div>
                            </div>
                            <div class="bui-box-align-top chat-mine">
                                <div class="span1">
                                    <div class="bui-box-align-right">
                                    <div class="chat-content bui-arrow-right">${item.content}
                                    </div>
                                    </div>
                                </div>
                                <div class="chat-icon"><img src="${item.avatar || "images/applogo.png"}" alt=""></div>
                            </div>
                        </div>
                        `
            },
            chatTarget(item){
                // 对方的聊天
                return `<div class="chat-line">
                            <div class="bui-box-align-top chat-target" id="${item.id}">
                                <div class="chat-icon"><img src="${item.avatar || "images/img.svg"}" alt=""></div>
                                <div class="span1">
                                    <div class="chat-content bui-arrow-left">${ item.content }</div>
                                </div>
                            </div>
                        </div>`
            },
            tplChat(data){

                var html = "";

                data.forEach(item => {
                    html += item.target ? this.chatTarget(item) : this.chatMine(item);
                });

                return html;

            }
        },
        mounted: function(){
            // 数据解析后执行
        }
    });


    return bs;
})