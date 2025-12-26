// Cordova应用入口
var app = {
    // 应用初始化
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // 设备准备就绪
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        // 设置状态栏（如果有）
        if (window.StatusBar) {
            StatusBar.styleDefault();
            StatusBar.backgroundColorByHexString("#667eea");
        }

        // 隐藏启动画面
        navigator.splashscreen.hide();

        // 初始化应用
        this.initApp();
    },

    // 初始化应用
    initApp: function() {
        console.log('FitPet APP启动成功');

        // 检测网络状态
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("offline", this.onOffline, false);

        // 返回按钮处理
        document.addEventListener("backbutton", this.onBackKeyDown, false);

        // 加载主页面
        this.loadMainPage();
    },

    // 加载主页面
    loadMainPage: function() {
        // 已经通过www/index.html加载，这里可以添加额外初始化
        console.log('主页面加载完成');

        // 显示欢迎信息
        setTimeout(function() {
            if (typeof showToast === 'function') {
                showToast('FitPet欢迎你！', 'success');
            }
        }, 1000);
    },

    // 网络状态变化
    onOnline: function() {
        console.log('网络已连接');
        showToast('网络已恢复', 'success');
    },

    onOffline: function() {
        console.log('网络已断开');
        showToast('网络已断开，正在使用离线模式', 'warning');
    },

    // 返回按钮处理
    onBackKeyDown: function(e) {
        e.preventDefault();

        // 获取当前页面
        var currentPage = window.location.hash || '#index';

        // 如果在首页，提示退出
        if (currentPage === '#index' || currentPage === '#home') {
            if (confirm('确定要退出FitPet吗？')) {
                navigator.app.exitApp();
            }
        } else {
            // 其他页面返回上一页
            window.history.back();
        }
    },

    // 接收事件
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

// 启动应用
app.initialize();