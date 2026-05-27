// 本地存储工具类 - 带缓存优化
const Storage = {
    _cache: {},
    _cacheTime: {},
    
    get(key) {
        // 检查缓存，5秒内的数据直接返回
        const now = Date.now();
        if (this._cache[key] && (now - this._cacheTime[key]) < 5000) {
            return this._cache[key];
        }
        
        try {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            this._cache[key] = data;
            this._cacheTime[key] = now;
            return data;
        } catch (e) {
            return [];
        }
    },
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
        // 更新缓存
        this._cache[key] = data;
        this._cacheTime[key] = Date.now();
    },
    remove(key) {
        localStorage.removeItem(key);
        delete this._cache[key];
        delete this._cacheTime[key];
    },
    clearCache() {
        this._cache = {};
        this._cacheTime = {};
    }
};

// 页面导航高亮 - 优化DOM操作
function setActiveNav(page) {
    // 使用缓存的导航项引用
    if (!window.__navItems) {
        window.__navItems = document.querySelectorAll('.nav-item');
    }
    
    window.__navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
}

// 跳转页面（带参数）
function navigateTo(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    // 使用replace而非直接跳转，避免不必要的历史记录
    // 如果是同页面则使用replaceState
    if (url === window.location.pathname) {
        window.history.replaceState({}, '', fullUrl);
        window.location.reload();
    } else {
        window.location.href = fullUrl;
    }
}

// 读取JSON配置文件 - 带缓存
const JSON_CACHE = {};
async function loadJSON(filePath) {
    // 检查缓存
    if (JSON_CACHE[filePath]) {
        return JSON_CACHE[filePath];
    }
    
    try {
        const response = await fetch(filePath);
        const data = await response.json();
        JSON_CACHE[filePath] = data;
        return data;
    } catch (e) {
        console.error('加载配置文件失败:', e);
        return {};
    }
}

// 弹窗缓存
const MODAL_CACHE = {};

// 显示弹窗
function showModal(modalId) {
    if (!MODAL_CACHE[modalId]) {
        MODAL_CACHE[modalId] = document.getElementById(modalId);
    }
    MODAL_CACHE[modalId].style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// 隐藏弹窗
function hideModal(modalId) {
    if (!MODAL_CACHE[modalId]) {
        MODAL_CACHE[modalId] = document.getElementById(modalId);
    }
    MODAL_CACHE[modalId].style.display = 'none';
    document.body.style.overflow = '';
}

// 解析URL参数 - 带缓存
function getUrlParams() {
    if (!window.__urlParams) {
        window.__urlParams = Object.fromEntries(new URLSearchParams(window.location.search));
    }
    return window.__urlParams;
}

// 图片懒加载工具
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.1
    });
    
    images.forEach(img => observer.observe(img));
}

// 防抖函数
function debounce(fn, delay = 300) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// 节流函数
function throttle(fn, limit = 100) {
    let inThrottle = false;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 批量DOM操作
function batchDOMUpdate(callback) {
    const fragment = document.createDocumentFragment();
    callback(fragment);
    return fragment;
}

// ======================
// 已移除OCR功能
// ======================

function drawResult(ma, mv, s1, s2, s3, s4) {
    const c = document.createElement('canvas');
    c.width = 360;
    c.height = 480;
    const g = c.getContext('2d');

    g.fillStyle = "#1b1b1b";
    g.fillRect(0,0,360,480);

    g.fillStyle = "#e63946";
    g.font = "20px sans-serif";
    g.fillText("碎片分析结果", 100, 40);

    g.fillStyle = "#fff";
    g.font = "16px sans-serif";
    g.fillText(`主属性：${ma} = ${mv}`, 20, 90);
    g.fillText(`副词条1：${s1}`, 20, 130);
    g.fillText(`副词条2：${s2}`, 20, 170);
    g.fillText(`副词条3：${s3}`, 20, 210);
    g.fillText(`副词条4：${s4}`, 20, 250);

    document.getElementById('resultImage').src = c.toDataURL();
    document.getElementById('resultCard').style.display = "block";
}

function saveOneFragment(data) {
    const params = getUrlParams();
    const list = Storage.get('myCharacters');
    const idx = list.findIndex(x => x.id === params.id && x.self === params.self);
    const char = list[idx];
    if (!char.fragments) char.fragments = [];
    if (char.fragments.length >=6) {
        alert("最多只能保存6个碎片！");
        return;
    }
    char.fragments.push(data);
    list[idx] = char;
    Storage.set('myCharacters', list);
    window.location.reload();
}