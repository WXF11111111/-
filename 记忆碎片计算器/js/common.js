// 本地存储工具类
const Storage = {
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    remove(key) {
        localStorage.removeItem(key);
    }
};

// 页面导航高亮
function setActiveNav(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (activeItem) activeItem.classList.add('active');
}

// 跳转页面（带参数）
function navigateTo(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    window.location.href = queryString ? `${url}?${queryString}` : url;
}

// URL参数
function getUrlParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
}

// modal
function showModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function hideModal(id) {
    document.getElementById(id).style.display = 'none';
}