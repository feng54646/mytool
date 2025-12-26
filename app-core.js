// FitPet应用核心
class FitPetApp {
    constructor() {
        this.currentPage = 'index';
        this.userData = this.loadUserData();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.setupServiceWorker();
        this.checkFirstLaunch();
    }

    // 加载用户数据
    loadUserData() {
        const saved = localStorage.getItem('fitpet_user');
        if (saved) {
            return JSON.parse(saved);
        }

        return {
            id: 'user_' + Date.now(),
            name: '新用户',
            age: 15,
            level: 'beginner',
            streak: 0,
            coins: 0,
            pet: {
                name: '小Fit',
                type: 'cat',
                level: 1,
                exp: 0,
                mood: '开心',
                accessories: []
            },
            settings: {
                notifications: true,
                sound: true,
                vibration: true,
                theme: 'light'
            },
            achievements: [],
            workoutHistory: [],
            totalDonation: 0
        };
    }

    // 保存用户数据
    saveUserData() {
        localStorage.setItem('fitpet_user', JSON.stringify(this.userData));

        // 同步到IndexedDB
        if (window.mobileEnhancer && window.mobileEnhancer.db) {
            const transaction = window.mobileEnhancer.db.transaction(['userData'], 'readwrite');
            const store = transaction.objectStore('userData');
            store.put(this.userData);
        }
    }

    // 设置导航
    setupNavigation() {
        // 拦截所有链接点击
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.target) {
                e.preventDefault();
                const url = new URL(link.href);
                this.navigateTo(url.pathname);
            }
        });

        // 处理浏览器前进后退
        window.addEventListener('popstate', (e) => {
            this.loadPage(window.location.pathname);
        });
    }

    // 导航到页面
    navigateTo(path) {
        history.pushState({}, '', path);
        this.loadPage(path);
    }

    // 加载页面
    async loadPage(path) {
        const pageName = path.split('/').pop().replace('.html', '') || 'index';
        this.currentPage = pageName;

        // 显示加载状态
        this.showLoading();

        try {
            // 加载页面内容
            const response = await fetch(`${pageName}.html`);
            const html = await response.text();

            // 解析HTML，提取主要内容
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.querySelector('.container') || doc.body;

            // 更新页面内容
            const container = document.getElementById('app-container');
            container.innerHTML = content.innerHTML;

            // 执行页面特定的脚本
            this.executePageScripts(pageName);

            // 更新页面标题
            document.title = doc.title || 'FitPet';

            // 触发页面加载完成事件
            this.onPageLoaded(pageName);

        } catch (error) {
            console.error('加载页面失败:', error);
            this.showError('页面加载失败，请检查网络连接');
        } finally {
            this.hideLoading();
        }
    }

    // 执行页面特定脚本
    executePageScripts(pageName) {
        switch(pageName) {
            case 'index':
                this.initLoginPage();
                break;
            case 'questionnaire':
                this.initQuestionnairePage();
                break;
            case 'home':
                this.initHomePage();
                break;
            case 'pet-feedback':
                this.initFeedbackPage();
                break;
        }
    }

    // 页面加载完成回调
    onPageLoaded(pageName) {
        // 添加页面进入动画
        const container = document.getElementById('app-container');
        container.classList.add('page-enter');

        setTimeout(() => {
            container.classList.remove('page-enter');
        }, 300);

        // 更新底部导航激活状态
        this.updateNavActive(pageName);

        // 发送页面浏览事件
        this.trackPageView(pageName);
    }

    // 更新导航激活状态
    updateNavActive(pageName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href && href.includes(pageName)) {
                item.classList.add('active');
            }
        });
    }

    // 显示加载状态
    showLoading() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.display = 'flex';
            loader.style.opacity = '1';
        }
    }

    // 隐藏加载状态
    hideLoading() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    }

    // 显示错误
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        document.getElementById('app-container').prepend(errorDiv);

        // 振动提示
        if (window.mobileEnhancer) {
            window.mobileEnhancer.vibrate(100);
        }
    }

    // 设置Service Worker
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker 注册成功:', registration);

                    // 检查更新
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showUpdateAvailable();
                            }
                        });
                    });
                })
                .catch(error => {
                    console.log('ServiceWorker 注册失败:', error);
                });
        }
    }

    // 显示更新可用
    showUpdateAvailable() {
        const updateDiv = document.createElement('div');
        updateDiv.className = 'update-available';
        updateDiv.innerHTML = `
            <span>有新版本可用</span>
            <button onclick="location.reload()">立即更新</button>
        `;

        document.body.appendChild(updateDiv);
    }

    // 检查首次启动
    checkFirstLaunch() {
        const firstLaunch = localStorage.getItem('fitpet_first_launch');
        if (!firstLaunch) {
            localStorage.setItem('fitpet_first_launch', 'true');
            this.showWelcome();
        }
    }

    // 显示欢迎引导
    showWelcome() {
        setTimeout(() => {
            this.showToast('欢迎使用FitPet！开始你的健康之旅吧～', 'success');
        }, 1000);
    }

    // 页面初始化函数
    initLoginPage() {
        // 登录页面初始化
        const loginBtns = document.querySelectorAll('.login-btn');
        loginBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.closest('.login-btn').classList[1];
                this.handleLogin(type);
            });
        });
    }

    initQuestionnairePage() {
        // 问卷页面初始化
        console.log('初始化问卷页面');
    }

    initHomePage() {
        // 主页初始化
        console.log('初始化主页');

        // 更新用户信息
        this.updateUserInfo();

        // 绑定任务开始按钮
        const startBtn = document.querySelector('.btn-start');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startWorkout();
            });
        }
    }

    initFeedbackPage() {
        // 反馈页面初始化
        console.log('初始化反馈页面');
    }

    // 处理登录
    handleLogin(type) {
        switch(type) {
            case 'wechat':
                this.loginWithWechat();
                break;
            case 'qq':
                this.loginWithQQ();
                break;
            case 'demo':
                this.loginAsDemo();
                break;
        }
    }

    loginWithWechat() {
        this.showToast('微信登录（模拟）', 'info');
        setTimeout(() => {
            this.navigateTo('questionnaire.html');
        }, 1000);
    }

    loginWithQQ() {
        this.showToast('QQ登录（模拟）', 'info');
        setTimeout(() => {
            this.navigateTo('questionnaire.html');
        }, 1000);
    }

    loginAsDemo() {
        this.userData.name = '体验用户';
        this.saveUserData();
        this.showToast('进入体验模式', 'success');
        setTimeout(() => {
            this.navigateTo('home.html');
        }, 1000);
    }

    // 更新用户信息显示
    updateUserInfo() {
        document.querySelectorAll('.username').forEach(el => {
            el.textContent = this.userData.name;
        });

        document.querySelectorAll('.user-streak').forEach(el => {
            el.textContent = this.userData.streak;
        });

        document.querySelectorAll('.user-coins').forEach(el => {
            el.textContent = this.userData.coins;
        });
    }

    // 开始锻炼
    startWorkout() {
        this.showToast('开始今日锻炼！', 'success');

        // 模拟锻炼完成
        setTimeout(() => {
            this.completeWorkout();
        }, 3000);
    }

    // 完成锻炼
    completeWorkout() {
        // 更新用户数据
        this.userData.streak++;
        this.userData.coins += 10;
        this.userData.pet.exp += 20;

        // 检查宠物升级
        if (this.userData.pet.exp >= 100) {
            this.userData.pet.level++;
            this.userData.pet.exp = 0;
            this.showToast(`恭喜！${this.userData.pet.name}升级到${this.userData.pet.level}级！`, 'success');
        }

        // 更新公益捐赠
        this.userData.totalDonation += 0.01;

        // 保存数据
        this.saveUserData();

        // 跳转到反馈页面
        this.navigateTo('pet-feedback.html');
    }

    // 显示Toast
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `app-toast toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);

        // 振动反馈
        if (window.mobileEnhancer) {
            window.mobileEnhancer.vibrate(50);
        }
    }

    // 追踪页面浏览
    trackPageView(pageName) {
        // 这里可以集成分析工具
        console.log(`页面浏览: ${pageName}`);
    }

    // 检查应用更新
    checkAppUpdate() {
        // 这里可以检查服务器是否有新版本
        return false;
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.fitpetApp = new FitPetApp();
});