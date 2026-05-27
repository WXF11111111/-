/* =========================
   Storage（安全版）
========================= */
const Storage = {
    get(key, fallback = null) {
        try {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : fallback;
        } catch (e) {
            console.warn(`Storage.get 解析失败: ${key}`, e);
            return fallback;
        }
    },

    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Storage.set 失败: ${key}`, e);
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    }
};

/* =========================
   页面导航
========================= */
function setActiveNav(page) {
    document.querySelectorAll('.nav-item')
        .forEach(item => item.classList.remove('active'));

    const active = document.querySelector(
        `.nav-item[data-page="${page}"]`
    );

    if (active) active.classList.add('active');
}

/* =========================
   路由系统（升级版）
========================= */
function navigateTo(url, params = {}) {
    const qs = new URLSearchParams(params).toString();
    window.location.href = qs ? `${url}?${qs}` : url;
}

/* =========================
   URL参数
========================= */
function getUrlParams() {
    return Object.fromEntries(
        new URLSearchParams(window.location.search)
    );
}

/* =========================
   JSON加载
========================= */
async function loadJSON(path) {
    try {
        const res = await fetch(path);
        return await res.json();
    } catch (e) {
        console.error("JSON加载失败:", path, e);
        return null;
    }
}

/* =========================
   UI工具
========================= */
function showModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}

function hideModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

/* =========================
   ⚠️ 业务层（建议迁移出去）
========================= */

/**
 * ⚠️ 建议：不要放在common.js
 * 👉 以后应该迁移到 fragment-service.js
 */
function saveOneFragment(data) {
    const params = getUrlParams();
    const list = Storage.get('myCharacters', []);

    const idx = list.findIndex(
        x => x.id === params.id && x.self === params.self
    );

    if (idx === -1) {
        alert("角色不存在");
        return;
    }

    const char = list[idx];
    if (!Array.isArray(char.fragments)) {
        char.fragments = [];
    }

    if (char.fragments.length >= 6) {
        alert("最多只能保存6个碎片");
        return;
    }

    char.fragments.push(data);

    list[idx] = char;
    Storage.set('myCharacters', list);

    return true;
}