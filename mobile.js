// 移动端增强功能
class MobileEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupGestures();
        this.setupVibration();
        this.setupOrientation();
        this.setupKeyboard();
        this.setupBackButton();
        this.setupPWA();
    }

    // 手势支持
    setupGestures() {
        // 滑动手势
        let startX, startY;
        let isScrolling;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
            startY = e.touches[0].pageY;
            isScrolling = undefined;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const x = e.touches[0].pageX;
            const y = e.touches[0].pageY;

            const dx = startX - x;
            const dy = startY - y;

            if (isScrolling === undefined) {
                isScrolling = Math.abs(dx) < Math.abs(dy);
            }

            if (!isScrolling) {
                // 水平滑动 - 可用于页面切换
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const x = e.changedTouches[0].pageX;
            const y = e.changedTouches[0].pageY;

            const dx = startX - x;
            const dy = startY - y;

            // 左滑手势
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && dx > 0) {
                this.handleSwipeLeft();
            }

            // 右滑手势
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && dx < 0) {
                this.handleSwipeRight();
            }

            startX = null;
            startY = null;
        }, { passive: true });
    }

    handleSwipeLeft() {
        // 左滑 - 前进
        console.log('左滑手势');
    }

    handleSwipeRight() {
        // 右滑 - 返回
        if (window.history.length > 1) {
            window.history.back();
        }
    }

    // 振动反馈
    setupVibration() {
        // 检查是否支持振动API
        this.supportsVibration = 'vibrate' in navigator;

        // 为按钮添加振动反馈
        document.addEventListener('click', (e) => {
            const target = e.target;

            if (target.tagName === 'BUTTON' ||
                target.classList.contains('btn') ||
                target.classList.contains('nav-item')) {
                this.vibrate(30);
            }
        });
    }

    vibrate(duration = 30) {
        if (this.supportsVibration) {
            navigator.vibrate(duration);
        }
    }

    // 屏幕方向处理
    setupOrientation() {
        // 锁定为竖屏
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('portrait').catch(() => {
                console.log('屏幕方向锁定失败');
            });
        }

        // 监听方向变化
        window.addEventListener('orientationchange', () => {
            this.onOrientationChange();
        });
    }

    onOrientationChange() {
        const orientation = window.orientation;

        if (Math.abs(orientation) === 90) {
            // 横屏模式
            this.showToast('请使用竖屏模式以获得最佳体验', 'warning');
        }
    }

    // 键盘处理
    setupKeyboard() {
        // 监听键盘弹出
        window.addEventListener('resize', () => {
            if (document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA') {
                this.scrollToActiveElement();
            }
        });
    }

    scrollToActiveElement() {
        const activeElement = document.activeElement;
        if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // 返回按钮处理
    setupBackButton() {
        // 监听Android返回按钮
        document.addEventListener('backbutton', (e) => {
            e.preventDefault();
            this.handleBackButton();
        }, false);

        // 监听页面可见性变化（用于PWA）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 应用进入后台
                this.onAppPause();
            } else {
                // 应用回到前台
                this.onAppResume();
            }
        });
    }

    handleBackButton() {
        const currentPage = this.getCurrentPage();

        if (currentPage === 'home' || currentPage === 'index') {
            // 显示退出确认
            if (confirm('确定要退出FitPet吗？')) {
                if (navigator.app && navigator.app.exitApp) {
                    navigator.app.exitApp();
                } else if (window.close) {
                    window.close();
                }
            }
        } else {
            window.history.back();
        }
    }

    onAppPause() {
        // 应用进入后台
        console.log('应用进入后台');
    }

    onAppResume() {
        // 应用回到前台
        console.log('应用回到前台');
        this.checkForUpdates();
    }

    // PWA功能
    setupPWA() {
        // 检查是否已安装
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.body.classList.add('pwa-installed');
        }

        // 监听安装提示
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // 监听应用安装
        window.addEventListener('appinstalled', () => {
            console.log('应用已安装');
            this.showToast('FitPet已成功安装到桌面！', 'success');
        });
    }

    showInstallPrompt() {
        // 显示安装提示
        const installBtn = document.createElement('button');
        installBtn.className = 'install-prompt';
        installBtn.innerHTML = '<i class="fas fa-download"></i> 安装FitPet应用';
        installBtn.onclick = () => this.installApp();

        document.body.appendChild(installBtn);

        // 5秒后自动隐藏
        setTimeout(() => {
            installBtn.remove();
        }, 5000);
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('用户接受了安装提示');
            }

            this.deferredPrompt = null;
        }
    }

    // 工具方法
    getCurrentPage() {
        const path = window.location.pathname;
        return path.split('/').pop().replace('.html', '');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `mobile-toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    checkForUpdates() {
        // 检查应用更新
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg) {
                    reg.update();
                }
            });
        }
    }

    // 网络状态
    setupNetworkStatus() {
        window.addEventListener('online', () => {
            this.showToast('网络已恢复', 'success');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.showToast('网络已断开，正在使用离线模式', 'warning');
        });
    }

    async syncOfflineData() {
        // 同步离线数据
        console.log('同步离线数据...');
    }

    // 本地存储增强
    setupStorage() {
        // 使用IndexedDB存储大量数据
        if ('indexedDB' in window) {
            this.initIndexedDB();
        }
    }

    initIndexedDB() {
        const request = indexedDB.open('FitPetDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // 创建运动记录存储
            if (!db.objectStoreNames.contains('workouts')) {
                const workoutStore = db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
                workoutStore.createIndex('date', 'date', { unique: false });
            }

            // 创建宠物数据存储
            if (!db.objectStoreNames.contains('petData')) {
                db.createObjectStore('petData', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log('IndexedDB初始化成功');
        };

        request.onerror = (event) => {
            console.error('IndexedDB初始化失败:', event.target.error);
        };
    }
}

// 初始化移动增强
document.addEventListener('DOMContentLoaded', () => {
    window.mobileEnhancer = new MobileEnhancer();
});