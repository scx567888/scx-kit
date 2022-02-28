class WebSocketHelper {
    constructor(_wsUrl) {
        // 心跳检测字符
        const LOVE = "❤";
        // 连接url 需要从外部传过来
        const wsUrl = _wsUrl;
        // 连接对象
        let WEB_SOCKET = null;
        // 防止重复触发重连方法的锁
        let lockReconnect = false;
        // 心跳检测定时器
        let startLoveInterval = null;
        // 因连接状态发送失败的请求 都会以方法的形式被存储到这里 待到下一次连接成功时 全部发送给服务器
        const FAILED_SEND_EVENT_LIST = [];

        this.onmessage = (data) => {
            console.log(data)
        }

        //创建连接方法
        this.createWebSocket = () => {
            try {
                //创建连接
                WEB_SOCKET = new WebSocket(wsUrl);
                //连接成功事件
                WEB_SOCKET.onopen = (event) => {
                    console.log(`%c WebSocket 连接成功... ${new Date()} `, 'background: #222; color: #bada55');
                    startLove();
                    retryFailedSendEvent();
                };
                //消息发送事件
                WEB_SOCKET.onmessage = (event) => {
                    //心跳检测
                    if (event.data === LOVE) {
                        console.log(`%c WebSocket 心跳检测成功...  ${new Date()} `, 'background: #222; color: #2196f3');
                        return;
                    }
                    this.onmessage(event.data);
                }
                //关闭事件
                WEB_SOCKET.onclose = () => {
                    clearStartLove();
                    reconnect();
                };
                //连接异常事件
                WEB_SOCKET.onerror = () => {
                    clearStartLove();
                    reconnect();
                };
            } catch (e) {
                clearStartLove();
                reconnect();
            }
        }

        //重连方法
        const reconnect = () => {
            if (!lockReconnect) {
                console.warn("WebSocket 重连中... ", new Date());
                lockReconnect = true;
                setTimeout(() => {     //没连接上会一直重连，设置延迟为5000毫秒避免请求过多
                    lockReconnect = false;
                    this.createWebSocket();
                }, 5000);
            }
        }

        //发送消息
        this.send = (json) => {
            const jsonStr = JSON.stringify(json);
            try {
                WEB_SOCKET.send(jsonStr);
            } catch (e) {
                FAILED_SEND_EVENT_LIST.push(() => WEB_SOCKET.send(jsonStr))
            }
        }

        //心跳检测 默认一分钟发一次
        const startLove = () => {
            startLoveInterval = setInterval(() => WEB_SOCKET.send(LOVE), 1000 * 60 * 5);
        }

        //重试发送错误的请求
        const retryFailedSendEvent = () => {
            for (let f of FAILED_SEND_EVENT_LIST) {
                try {
                    f();
                } catch (e) {
                    console.error(e);
                }
            }
            //清空数组中所有事件
            FAILED_SEND_EVENT_LIST.splice(0, FAILED_SEND_EVENT_LIST.length);
        }

        //清理心跳检测定时器
        const clearStartLove = () => {
            if (startLoveInterval != null) {
                clearInterval(startLoveInterval)
            }
        }

    }

}

//事件总线事件
class EBEvent {
    constructor(name, event, isWSEvent) {
        this.name = name;
        this.event = event;
        this.isWSEvent = isWSEvent;
    }
}

//前后台发送消息 (websocket) 的封装体
class WSBody {
    constructor(name, data) {
        this.name = name;
        this.data = data;
    }
}

class ScxEventBus {

    /**
     *
     * @param scxBaseApiUrl {ScxBaseApiUrl}
     */
    constructor(scxBaseApiUrl) {

        //创建 websocket worker
        const webSocketHelper = new WebSocketHelper(scxBaseApiUrl.joinWSUrl('/scx'));
        webSocketHelper.createWebSocket();

        //事件列表
        this.eventList = [];

        this.findEventByName = (name) => {
            return this.eventList.filter(c => c.name === name && c.isWSEvent === false);
        }

        this.findWSEventByName = (name) => {
            return this.eventList.filter(c => c.name === name && c.isWSEvent === true);
        }

        //将之前添加的旧事件移除
        this.removeOldEvent = (thisEvent) => {
            for (let i = 0; i < this.eventList.length; i++) {
                const v = this.eventList[i];
                if (Object.entries(v).toString() === Object.entries(thisEvent).toString()) {
                    this.eventList.splice(i, 1);
                    break;
                }
            }
        }

        //添加消费者
        this.consumer = (name, event) => {
            const thisEvent = new EBEvent(name, event, false);
            this.removeOldEvent(thisEvent)
            this.eventList.push(thisEvent);
        };

        //添加 websocket 消费者
        this.wsConsumer = (name, event) => {
            const thisEvent = new EBEvent(name, event, true);
            this.removeOldEvent(thisEvent)
            this.eventList.push(thisEvent);
        };

        //发送事件
        this.publish = (name, message) => {
            this.findEventByName(name).forEach(c => c.event(message));
        };

        //发送事件
        this.wsPublish = (name, message) => {
            webSocketHelper.send(new WSBody(name, message));
        };

        //监听 websocket 的事件
        webSocketHelper.onmessage = (data) => {
            const json = JSON.parse(data);
            const wsBody = new WSBody(json.name, json.data);
            if (wsBody.name) {
                this.findWSEventByName(wsBody.name).forEach(c => c.event(wsBody.data));
            }
        }

    }
}

export {
    ScxEventBus
}