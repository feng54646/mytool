// Service Worker for FitPet App
const CACHE_VERSION = 'v2.0.1';
const CACHE_NAME = `fitpet-cache-${CACHE_VERSION}`;

// 需要缓存的资源
const PRECACHE_URLS = [
    './',
    './index.html',
    './questionnaire.html',
    './home.html',
    './pet-feedback.html',
    './style.css',
    './mobile.css',
    './script.js',
    './app-core.js',
    './mobile.js',
    './data.json',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    './icons/icon-72x72.png',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// 安装事件
self.addEventListener('install', event => {
    console.log('Service Worker 安装中...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('缓存已打开，开始预缓存...');
                return cache.addAll(PRECACHE_URLS)
                    .then(() => {
                        console.log('预缓存完成');
                        return self.skipWaiting();
                    });
            })
            .catch(error => {
                console.error('预缓存失败:', error);
            })
    );
});

// 激活事件
self.addEventListener('activate', event => {
    console.log('Service Worker 激活中...');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker 激活完成');
            return self.clients.claim();
        })
    );
});

// 获取事件 - 缓存优先，网络兜底策略
self.addEventListener('fetch', event => {
    // 跳过非GET请求
    if (event.request.method !== 'GET') return;

    // 跳过Chrome扩展
    if (event.request.url.startsWith('chrome-extension://')) return;

    // 处理API请求（不缓存）
    if (event.request.url.includes('/api/')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // 处理静态资源请求
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // 从缓存返回，同时更新缓存
                    updateCache(event.request);
                    return cachedResponse;
                }

                // 没有缓存，从网络获取
                return fetch(event.request)
                    .then(networkResponse => {
                        // 检查响应是否有效
                        if (!networkResponse ||
                            networkResponse.status !== 200 ||
                            networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // 克隆响应以缓存
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(error => {
                        console.log('获取失败:', error);

                        // 如果是HTML请求，返回离线页面
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('./index.html');
                        }

                        // 返回自定义的离线响应
                        return offlineResponse(event.request);
                    });
            })
    );
});

// 网络优先策略
function networkFirst(request) {
    return fetch(request)
        .then(networkResponse => {
            // 克隆响应以缓存
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
                .then(cache => {
                    cache.put(request, responseToCache);
                });

            return networkResponse;
        })
        .catch(() => {
            // 网络失败，尝试从缓存获取
            return caches.match(request);
        });
}

// 更新缓存
function updateCache(request) {
    fetch(request)
        .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(request, networkResponse);
                    });
            }
        })
        .catch(() => {
            // 更新失败，忽略
        });
}

// 离线响应
function offlineResponse(request) {
    // 根据请求类型返回不同的离线响应
    const url = new URL(request.url);

    if (url.pathname.endsWith('.html')) {
        return caches.match('./index.html');
    }

    if (url.pathname.endsWith('.css')) {
        return new Response('/* 离线模式 */', {
            headers: { 'Content-Type': 'text/css' }
        });
    }

    if (url.pathname.endsWith('.js')) {
        return new Response('// 离线模式', {
            headers: { 'Content-Type': 'application/javascript' }
        });
    }

    // 默认响应
    return new Response('网络连接失败，请检查网络设置', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' }
    });
}

// 监听消息
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data === 'clearCache') {
        caches.delete(CACHE_NAME);
    }
});

// 监听推送事件
self.addEventListener('push', event => {
    console.log('收到推送消息:', event);

    const options = {
        body: event.data ? event.data.text() : 'FitPet提醒你该运动了！',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'start',
                title: '开始运动'
            },
            {
                action: 'close',
                title: '关闭'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('FitPet', options)
    );
});

// 监听通知点击
self.addEventListener('notificationclick', event => {
    console.log('通知被点击:', event.notification.tag);

    event.notification.close();

    if (event.action === 'start') {
        // 用户点击了"开始运动"
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(clientList => {
                    for (const client of clientList) {
                        if (client.url.includes('/home.html') && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    if (clients.openWindow) {
                        return clients.openWindow('./home.html');
                    }
                })
        );
    }
});