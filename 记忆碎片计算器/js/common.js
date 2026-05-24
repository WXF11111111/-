// 本地存储工具类
const Storage = {
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            return [];
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
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    window.location.href = fullUrl;
}

// 读取JSON配置文件
async function loadJSON(filePath) {
    try {
        const response = await fetch(filePath);
        return await response.json();
    } catch (e) {
        console.error('加载配置文件失败:', e);
        return {};
    }
}

// 显示弹窗
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// 隐藏弹窗
function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 解析URL参数
function getUrlParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
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