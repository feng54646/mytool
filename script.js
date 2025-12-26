// 通用工具函数
class FitPetApp {
    constructor() {
        this.userData = this.loadUserData();
        this.initEventListeners();
    }

    // 加载用户数据
    loadUserData() {
        const savedData = localStorage.getItem('fitpet_user_data');
        if (savedData) {
            return JSON.parse(savedData);
        }

        // 默认用户数据
        return {
            username: '青少年用户',
            streak: 3,
            coins: 45,
            petLevel: 2,
            petExp: 60,
            petMood: '活力满满！',
            todayTaskCompleted: false,
            taskProgress: 0,
            questionnaireAnswers: [],
            totalDonations: 15.41
        };
    }

    // 保存用户数据
    saveUserData() {
        localStorage.setItem('fitpet_user_data', JSON.stringify(this.userData));
    }

    // 初始化事件监听器
    initEventListeners() {
        // 防止表单提交刷新页面
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        });
    }

    // 显示加载提示
    showLoading(message = '加载中...') {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loadingDiv);

        return loadingDiv;
    }

    // 隐藏加载提示
    hideLoading(loadingDiv) {
        if (loadingDiv && loadingDiv.parentNode) {
            loadingDiv.parentNode.removeChild(loadingDiv);
        }
    }

    // 显示消息提示
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 3秒后自动消失
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 模拟API请求
    async simulateAPIRequest(delay = 1000) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, delay);
        });
    }
}

// 创建全局应用实例
window.fitpetApp = new FitPetApp();

// 登录相关函数
function loginWithWechat() {
    const loading = window.fitpetApp.showLoading('正在连接微信...');

    setTimeout(() => {
        window.fitpetApp.hideLoading(loading);
        window.fitpetApp.showToast('微信登录成功！', 'success');

        // 模拟登录后跳转到问卷页面
        setTimeout(() => {
            window.location.href = 'questionnaire.html';
        }, 1000);
    }, 1500);
}

function loginWithQQ() {
    const loading = window.fitpetApp.showLoading('正在连接QQ...');

    setTimeout(() => {
        window.fitpetApp.hideLoading(loading);
        window.fitpetApp.showToast('QQ登录成功！', 'success');

        setTimeout(() => {
            window.location.href = 'questionnaire.html';
        }, 1000);
    }, 1500);
}

function loginAsDemo() {
    const loading = window.fitpetApp.showLoading('进入体验模式...');

    setTimeout(() => {
        window.fitpetApp.hideLoading(loading);
        window.fitpetApp.showToast('欢迎体验 FitPet！', 'success');

        // 使用演示用户数据
        const demoData = {
            username: '体验用户',
            streak: 1,
            coins: 20,
            petLevel: 1,
            petExp: 30,
            petMood: '初次见面！',
            todayTaskCompleted: false,
            taskProgress: 0,
            questionnaireAnswers: [0, 1, 0, 0, 1, 0, 0, 0],
            totalDonations: 0.05
        };

        localStorage.setItem('fitpet_user_data', JSON.stringify(demoData));

        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    }, 1500);
}

// 通用页面加载函数
function initPage() {
    // 加载用户数据
    const userData = window.fitpetApp.loadUserData();

    // 更新页面中的用户数据
    const usernameElements = document.querySelectorAll('#username, .username');
    const streakElements = document.querySelectorAll('#streak, .streak');
    const coinsElements = document.querySelectorAll('#coins, .coins');
    const petLevelElements = document.querySelectorAll('#petLevel, .pet-level');

    usernameElements.forEach(el => {
        if (el.id === 'username' || el.classList.contains('username')) {
            el.textContent = userData.username;
        }
    });

    streakElements.forEach(el => {
        if (el.id === 'streak' || el.classList.contains('streak')) {
            el.textContent = userData.streak;
        }
    });

    coinsElements.forEach(el => {
        if (el.id === 'coins' || el.classList.contains('coins')) {
            el.textContent = userData.coins;
        }
    });

    petLevelElements.forEach(el => {
        if (el.id === 'petLevel' || el.classList.contains('pet-level')) {
            el.textContent = userData.petLevel;
        }
    });

    // 添加页面加载动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
}

// 添加加载样式
const style = document.createElement('style');
style.textContent = `
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
    }

    .loading-content {
        text-align: center;
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f0f0f0;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .loading-content p {
        color: #666;
        font-size: 16px;
    }

    .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s, transform 0.3s;
        transform: translateX(-50%) translateY(20px);
    }

    .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }

    .toast-success {
        background: #4CAF50;
    }

    .toast-error {
        background: #FF6B6B;
    }

    .toast-info {
        background: #2196F3;
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查当前页面并初始化
    if (document.querySelector('.home-page') ||
        document.querySelector('.feedback-page')) {
        initPage();
    }

    // 添加页面切换动画
    const links = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="javascript"])');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // 如果是外部链接或下载链接，不处理
            if (this.target === '_blank' ||
                this.download ||
                this.href.includes('mailto:') ||
                this.href.includes('tel:')) {
                return;
            }

            // 阻止默认行为
            e.preventDefault();
            const href = this.href;

            // 添加页面离开动画
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.3s';

            // 延迟跳转
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
});
// 移动端增强功能
class FitPetMobile {
    constructor() {
        this.initCapacitor();
        this.setupMobileFeatures();
    }

    // 初始化Capacitor
    async initCapacitor() {
        if (typeof Capacitor !== 'undefined') {
            const { App, StatusBar, SplashScreen, Haptics } = Capacitor.Plugins;

            // 设置状态栏
            if (StatusBar) {
                await StatusBar.setBackgroundColor({ color: '#667eea' });
                await StatusBar.setStyle({ style: 'LIGHT' });
            }

            // 隐藏启动画面
            if (SplashScreen) {
                setTimeout(() => {
                    SplashScreen.hide();
                }, 2000);
            }

            // 监听返回按钮
            if (App) {
                App.addListener('backButton', (data) => {
                    this.handleBackButton(data);
                });
            }
        }
    }

    // 设置移动端特性
    setupMobileFeatures() {
        // 1. 禁用缩放
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }

        // 2. 触摸反馈
        this.setupTouchFeedback();

        // 3. 防止双击缩放
        this.preventDoubleTapZoom();

        // 4. 适配状态栏高度
        this.adjustForStatusBar();

        // 5. 离线支持
        this.setupOfflineSupport();
    }

    // 设置触摸反馈
    setupTouchFeedback() {
        const buttons = document.querySelectorAll('button, .btn, .nav-item, .option');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.classList.add('touch-active');
                this.vibrate('light');
            });

            button.addEventListener('touchend', () => {
                button.classList.remove('touch-active');
            });
        });
    }

    // 触觉反馈
    async vibrate(type = 'light') {
        if (typeof Capacitor !== 'undefined' && Capacitor.Plugins.Haptics) {
            const { Haptics } = Capacitor.Plugins;
            try {
                switch(type) {
                    case 'light':
                        await Haptics.impact({ style: 'LIGHT' });
                        break;
                    case 'medium':
                        await Haptics.impact({ style: 'MEDIUM' });
                        break;
                    case 'heavy':
                        await Haptics.impact({ style: 'HEAVY' });
                        break;
                    case 'success':
                        await Haptics.notification({ type: 'SUCCESS' });
                        break;
                    case 'warning':
                        await Haptics.notification({ type: 'WARNING' });
                        break;
                    case 'error':
                        await Haptics.notification({ type: 'ERROR' });
                        break;
                }
            } catch (error) {
                console.log('Haptics not available:', error);
            }
        }
    }

    // 防止双击缩放
    preventDoubleTapZoom() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }

    // 适配状态栏
    adjustForStatusBar() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        if (isIOS) {
            document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
            document.documentElement.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
        }

        if (isAndroid) {
            // Android状态栏高度通常为24dp
            document.documentElement.style.setProperty('--safe-area-top', '24px');
        }
    }

    // 离线支持
    setupOfflineSupport() {
        // 检测网络状态
        window.addEventListener('online', () => {
            this.showToast('网络已连接', 'success');
        });

        window.addEventListener('offline', () => {
            this.showToast('网络已断开，正在使用离线模式', 'warning');
        });

        // 缓存关键资源
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker 注册成功:', registration);
                    })
                    .catch(error => {
                        console.log('ServiceWorker 注册失败:', error);
                    });
            });
        }
    }

    // 处理返回按钮
    handleBackButton(data) {
        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage === 'home.html' || currentPage === 'index.html') {
            // 在首页点击返回按钮，提示退出
            if (confirm('确定要退出FitPet吗？')) {
                if (typeof Capacitor !== 'undefined' && Capacitor.Plugins.App) {
                    Capacitor.Plugins.App.exitApp();
                }
            }
        } else {
            // 在其他页面返回上一页
            window.history.back();
        }
    }

    // 显示Toast
    showToast(message, type = 'info') {
        // 这里可以重用之前的toast逻辑，添加震动反馈
        this.vibrate('light');

        const toast = document.createElement('div');
        toast.className = `mobile-toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 本地通知
    async scheduleNotification(title, body, scheduleAt) {
        if (typeof Capacitor !== 'undefined' && Capacitor.Plugins.LocalNotifications) {
            const { LocalNotifications } = Capacitor.Plugins;

            try {
                // 请求权限
                const permission = await LocalNotifications.requestPermissions();

                if (permission.display === 'granted') {
                    await LocalNotifications.schedule({
                        notifications: [
                            {
                                title: title,
                                body: body,
                                id: Date.now(),
                                schedule: { at: scheduleAt },
                                sound: 'default',
                                attachments: null,
                                actionTypeId: '',
                                extra: null
                            }
                        ]
                    });
                }
            } catch (error) {
                console.log('通知设置失败:', error);
            }
        }
    }

    // 获取设备信息
    async getDeviceInfo() {
        return {
            platform: this.getPlatform(),
            isMobile: this.isMobileDevice(),
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            pixelRatio: window.devicePixelRatio
        };
    }

    getPlatform() {
        const ua = navigator.userAgent;
        if (/Android/.test(ua)) return 'android';
        if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
        return 'web';
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}

// 初始化移动应用
document.addEventListener('DOMContentLoaded', () => {
    window.fitpetMobile = new FitPetMobile();

    // 添加移动端样式
    const mobileStyles = `
        /* 移动端优化样式 */
        :root {
            --safe-area-top: 0px;
            --safe-area-bottom: 0px;
        }

        body {
            padding-top: var(--safe-area-top);
            padding-bottom: var(--safe-area-bottom);
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }

        /* 触摸反馈 */
        button.touch-active, .btn.touch-active {
            transform: scale(0.95);
            opacity: 0.8;
        }

        /* 移动端Toast */
        .mobile-toast {
            position: fixed;
            bottom: calc(80px + var(--safe-area-bottom));
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(51, 51, 51, 0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 9999;
            opacity: 0;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            white-space: nowrap;
            max-width: 80%;
            text-align: center;
        }

        .mobile-toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        /* 防止iOS橡皮筋效果 */
        .container {
            overflow: hidden;
            max-height: 100vh;
        }

        /* 长按菜单禁用 */
        * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        /* 输入框除外 */
        input, textarea {
            -webkit-user-select: auto;
            user-select: auto;
        }

        /* 移动端底部导航优化 */
        .bottom-nav {
            padding-bottom: calc(10px + var(--safe-area-bottom));
        }

        /* iOS样式调整 */
        @supports (-webkit-touch-callout: none) {
            .container {
                min-height: -webkit-fill-available;
            }
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = mobileStyles;
    document.head.appendChild(styleSheet);
});