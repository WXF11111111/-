// DOM缓存
let _domCache = {};
const getDOM = (id) => {
    if (!_domCache[id]) {
        _domCache[id] = document.getElementById(id);
    }
    return _domCache[id];
};

// 数据缓存
let fragmentRules = typeof FRAGMENT_RULES !== 'undefined' ? FRAGMENT_RULES : { mainAttrs: {}, subAttrs: {} };
let allCharacters = typeof CHARACTERS_DATA !== 'undefined' ? CHARACTERS_DATA.characters : [];
let currentCharacter = null;
let currentPart = 'impact';

// 评分基准缓存
const mainMaxMap = {
    "攻击+": 22, "防御+": 22, "HP+": 37,
    "攻击%": 25, "防御%": 25, "HP%": 25,
    "暴击%": 27, "暴伤%": 40.8, "自我意识恢复": 40
};

const subMaxMap = {
    "攻击+": 8, "防御+": 5, "HP+": 12,
    "攻击%": 1.3, "防御%": 1.3, "HP%": 1.3,
    "暴击%": 2, "暴伤%": 4,
    "自我意识恢复": 5, "额外伤害%": 3.4, "持续伤害%": 3.4
};

// 评分权重配置
const SCORE_WEIGHTS = {
    dps: {
        mainAttr: { "攻击%": 1.0, "暴击%": 1.2, "暴伤%": 1.1, "攻击+": 0.9, "防御+": 0.3, "HP+": 0.1, "防御%": 0.2, "HP%": 0.1, "自我意识恢复": 0.3 },
        subAttr: { "暴击%": 1.2, "暴伤%": 1.1, "攻击+": 1.0, "额外伤害%": 1.0, "持续伤害%": 1.0, "防御+": 0.5, "自我意识恢复": 0.4, "攻击%": 0.7, "防御%": 0.3, "HP+": 0.1, "HP%": 0.05 }
    },
    def: {
        mainAttr: { "防御%": 1.0, "暴击%": 1.1, "暴伤%": 1.0, "防御+": 1.0, "自我意识恢复": 0.9, "攻击%": 0.5, "攻击+": 0.4, "HP+": 0.3, "HP%": 0.2 },
        subAttr: { "防御+": 1.2, "自我意识恢复": 1.0, "暴击%": 0.9, "暴伤%": 0.8, "额外伤害%": 0.8, "持续伤害%": 0.8, "攻击+": 0.5, "防御%": 0.7, "攻击%": 0.4, "HP+": 0.2, "HP%": 0.1 }
    },
    support: {
        mainAttr: { "防御%": 1.0, "自我意识恢复": 1.0, "防御+": 1.1, "HP%": 0.7, "攻击%": 0.3, "攻击+": 0.2, "暴击%": 0.3, "暴伤%": 0.2, "HP+": 0.3 },
        subAttr: { "防御+": 1.2, "自我意识恢复": 1.1, "防御%": 1.0, "HP%": 0.5, "攻击+": 0.3, "攻击%": 0.2, "暴击%": 0.2, "暴伤%": 0.1, "额外伤害%": 0.3, "持续伤害%": 0.3, "HP+": 0.3 }
    }
};

function getScoreWeights(charType) {
    return SCORE_WEIGHTS[charType] || {
        mainAttr: { "攻击%": 1.0, "暴击%": 1.0, "暴伤%": 1.0, "攻击+": 1.0, "防御%": 1.0, "防御+": 1.0, "HP%": 1.0, "HP+": 1.0, "自我意识恢复": 1.0 },
        subAttr: { "攻击+": 1.0, "防御+": 1.0, "HP+": 1.0, "攻击%": 1.0, "防御%": 1.0, "HP%": 1.0, "暴击%": 1.0, "暴伤%": 1.0, "自我意识恢复": 1.0, "额外伤害%": 1.0, "持续伤害%": 1.0 }
    };
}

// 初始化部位标签
function initPartTabs() {
    const tabs = document.querySelectorAll('.part-tab');
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            tabs.forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');
            currentPart = tab.dataset.part;
            updateMainAttrOptions();
        });
    });
}

// 更新主属性选项
function updateMainAttrOptions() {
    const select = getDOM('mainAttrSelect');
    if (!select) return;
    
    const attrs = fragmentRules.mainAttrs[currentPart] ? fragmentRules.mainAttrs[currentPart].attrs : [];
    
    select.innerHTML = '';
    
    attrs.forEach(function(a) {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        select.appendChild(opt);
    });
    
    if (attrs.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '暂无属性数据';
        select.appendChild(opt);
    }
}

// 更新副词条选项
function updateSubAttrOptions() {
    const keys = Object.keys(fragmentRules.subAttrs);
    const selects = [
        { el: getDOM('subAttr1Type'), label: '选择副词条1' },
        { el: getDOM('subAttr2Type'), label: '选择副词条2' },
        { el: getDOM('subAttr3Type'), label: '选择副词条3' },
        { el: getDOM('subAttr4Type'), label: '选择副词条4（强化+1）' }
    ];
    
    selects.forEach(function(item) {
        const el = item.el;
        const label = item.label;
        if (!el) return;
        
        el.innerHTML = '';
        
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = label;
        el.appendChild(defaultOpt);
        
        keys.forEach(function(k) {
            const opt = document.createElement('option');
            opt.value = k;
            opt.textContent = k;
            el.appendChild(opt);
        });
    });
}

// 评级查找表
const RANK_TABLE = { 95: 'T0', 85: 'T1', 70: 'T2', 55: 'T3' };

function getRank(rate) {
    const thresholds = [95, 85, 70, 55];
    for (let i = 0; i < thresholds.length; i++) {
        if (rate >= thresholds[i]) {
            return RANK_TABLE[thresholds[i]];
        }
    }
    return '普通';
}

// 计算评分
function calculateScore() {
    const mainType = getDOM('mainAttrSelect') ? getDOM('mainAttrSelect').value : '';
    const mainVal = getDOM('mainAttrValue') ? parseFloat(getDOM('mainAttrValue').value) || 0 : 0;

    const s1Type = getDOM('subAttr1Type') ? getDOM('subAttr1Type').value : '';
    const s1Val = getDOM('subAttr1Value') ? parseFloat(getDOM('subAttr1Value').value) || 0 : 0;
    const s2Type = getDOM('subAttr2Type') ? getDOM('subAttr2Type').value : '';
    const s2Val = getDOM('subAttr2Value') ? parseFloat(getDOM('subAttr2Value').value) || 0 : 0;
    const s3Type = getDOM('subAttr3Type') ? getDOM('subAttr3Type').value : '';
    const s3Val = getDOM('subAttr3Value') ? parseFloat(getDOM('subAttr3Value').value) || 0 : 0;
    const s4Type = getDOM('subAttr4Type') ? getDOM('subAttr4Type').value : '';
    const s4Val = getDOM('subAttr4Value') ? parseFloat(getDOM('subAttr4Value').value) || 0 : 0;

    let charType = 'dps';
    if (currentCharacter) {
        const found = allCharacters.find(function(c) { return c.id === currentCharacter.id; });
        charType = found ? found.type : 'dps';
    }
    const weights = getScoreWeights(charType);

    let mainScore = 0;
    const mainMax = mainMaxMap[mainType];
    if (mainMax && mainVal > 0) {
        const weight = weights.mainAttr[mainType] || 0.5;
        mainScore = (mainVal / mainMax) * 30 * weight;
    }

    let subScore = 0;
    const subAttrs = [
        { type: s1Type, val: s1Val },
        { type: s2Type, val: s2Val },
        { type: s3Type, val: s3Val },
        { type: s4Type, val: s4Val }
    ];
    
    for (let i = 0; i < subAttrs.length; i++) {
        const sub = subAttrs[i];
        if (sub.type && sub.val > 0 && subMaxMap[sub.type]) {
            const weight = weights.subAttr[sub.type] || 0.3;
            subScore += (sub.val / subMaxMap[sub.type]) * 7.5 * weight;
        }
    }

    const total = Math.round(mainScore + subScore);
    const rate = Math.min(100, Math.round((total / 60) * 100));
    const rank = getRank(rate);

    const resultDisplay = getDOM('resultDisplay');
    if (resultDisplay) {
        resultDisplay.style.display = 'block';
    }
    if (getDOM('scoreValue')) getDOM('scoreValue').textContent = total;
    if (getDOM('scoreRank')) getDOM('scoreRank').textContent = rank;
    if (getDOM('progressFill')) getDOM('progressFill').style.width = rate + '%';
    if (getDOM('graduationRate')) getDOM('graduationRate').textContent = rate + '%';
    if (getDOM('totalPoints')) getDOM('totalPoints').textContent = total;

    if (!currentCharacter) {
        alert("⚠️ 角色不存在！请从角色列表点击角色进入。");
        return;
    }

    const char = currentCharacter;
    if (!Array.isArray(char.fragments)) {
        char.fragments = [];
    }
    if (char.fragments.length >= 6) {
        alert("碎片已满6个，无法继续保存");
        return;
    }

    char.fragments.push({
        part: currentPart,
        mainAttr: mainType,
        mainValue: mainVal,
        sub1Type: s1Type,
        sub1Val: s1Val,
        sub2Type: s2Type,
        sub2Val: s2Val,
        sub3Type: s3Type,
        sub3Val: s3Val,
        sub4Type: s4Type,
        sub4Val: s4Val
    });

    const list = Storage.get('myCharacters');
    const idx = list.findIndex(function(x) { return x.id === char.id && x.self === char.self; });
    if (idx !== -1) {
        list[idx] = char;
        Storage.set('myCharacters', list);
        alert("✅ 碎片保存成功！切回详情页即可看到");
    }
}

// DOMContentLoaded时执行
document.addEventListener('DOMContentLoaded', function() {
    const params = getUrlParams();
    if (params.id && params.self) {
        const list = Storage.get('myCharacters');
        currentCharacter = list.find(function(x) { return x.id === params.id && x.self === params.self; });
    }
    
    initPartTabs();
    updateMainAttrOptions();
    updateSubAttrOptions();
});