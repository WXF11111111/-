let fragmentRules = FRAGMENT_RULES;
let allCharacters = CHARACTERS_DATA.characters;

let currentCharacter = null;
let currentPart = 'impact';

/* =========================
   初始化
========================= */
document.addEventListener('DOMContentLoaded', () => {
    initCharacter();
    initUI();
});

/* =========================
   初始化角色
========================= */
function initCharacter() {
    const p = getUrlParams();
    if (p.id && p.self) {
        const list = Storage.get('myCharacters');
        currentCharacter = list.find(x => x.id === p.id && x.self === p.self);
    }
}

/* =========================
   UI 初始化
========================= */
function initUI() {
    initPartTabs();
    updateMainAttrOptions();
    updateSubAttrOptions();
}

/* =========================
   tab控制
========================= */
function initPartTabs() {
    document.querySelectorAll('.part-tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.part-tab')
                .forEach(x => x.classList.remove('active'));

            tab.classList.add('active');
            currentPart = tab.dataset.part;

            updateMainAttrOptions();
        };
    });
}

/* =========================
   主属性选项
========================= */
function updateMainAttrOptions() {
    const select = document.getElementById('mainAttrSelect');
    select.innerHTML = '';

    const attrs = fragmentRules.mainAttrs[currentPart]?.attrs || [];

    attrs.forEach(attr => {
        const option = document.createElement('option');
        option.value = attr;
        option.textContent = attr;
        select.appendChild(option);
    });
}

/* =========================
   副词条选项
========================= */
function updateSubAttrOptions() {
    const keys = Object.keys(fragmentRules.subAttrs);

    const selects = [
        'subAttr1Type',
        'subAttr2Type',
        'subAttr3Type',
        'subAttr4Type'
    ].map(id => document.getElementById(id));

    selects.forEach(sel => {
        sel.innerHTML = '<option value="">选择副词条</option>';

        keys.forEach(k => {
            const opt = document.createElement('option');
            opt.value = k;
            opt.textContent = k;
            sel.appendChild(opt);
        });
    });
}

/* =========================
   权重系统（数据化）
========================= */
function getScoreWeights(type) {
    const WEIGHTS = {
        dps: {
            mainAttr: {
                "攻击%": 1.0, "暴击%": 1.2, "暴伤%": 1.1,
                "攻击+": 0.9, "防御+": 0.3, "HP+": 0.1,
                "防御%": 0.2, "HP%": 0.1, "自我意识恢复": 0.3
            },
            subAttr: {
                "暴击%": 1.2, "暴伤%": 1.1, "攻击+": 1.0,
                "额外伤害%": 1.0, "持续伤害%": 1.0,
                "防御+": 0.5, "自我意识恢复": 0.4,
                "攻击%": 0.7, "防御%": 0.3, "HP+": 0.1, "HP%": 0.05
            }
        },

        def: {
            mainAttr: {
                "防御%": 1.0, "暴击%": 1.1, "暴伤%": 1.0,
                "防御+": 1.0, "自我意识恢复": 0.9,
                "攻击%": 0.5, "攻击+": 0.4,
                "HP+": 0.3, "HP%": 0.2
            },
            subAttr: {
                "防御+": 1.2, "自我意识恢复": 1.0,
                "暴击%": 0.9, "暴伤%": 0.8,
                "额外伤害%": 0.8, "持续伤害%": 0.8,
                "攻击+": 0.5, "防御%": 0.7, "攻击%": 0.4,
                "HP+": 0.2, "HP%": 0.1
            }
        },

        support: {
            mainAttr: {
                "防御%": 1.0, "自我意识恢复": 1.0,
                "防御+": 1.1, "HP%": 0.7,
                "攻击%": 0.3, "攻击+": 0.2,
                "暴击%": 0.3, "暴伤%": 0.2,
                "HP+": 0.3
            },
            subAttr: {
                "防御+": 1.2, "自我意识恢复": 1.1,
                "防御%": 1.0, "HP%": 0.5,
                "攻击+": 0.3, "攻击%": 0.2,
                "暴击%": 0.2, "暴伤%": 0.1,
                "额外伤害%": 0.3, "持续伤害%": 0.3,
                "HP+": 0.3
            }
        }
    };

    return WEIGHTS[type] || WEIGHTS.dps;
}

/* =========================
   核心计算函数
========================= */
function calculateScore() {
    const data = collectInputData();

    const charType = getCharacterType();
    const weights = getScoreWeights(charType);

    const mainScore = calcMainScore(data, weights);
    const subScore = calcSubScore(data, weights);

    const total = Math.round(mainScore + subScore);
    const rate = Math.min(100, Math.round((total / 60) * 100));
    const rank = calcRank(rate);

    renderResult({ total, rate, rank });

    saveFragment(data);
}

/* =========================
   收集输入
========================= */
function collectInputData() {
    return {
        mainType: document.getElementById('mainAttrSelect').value,
        mainVal: parseFloat(document.getElementById('mainAttrValue').value) || 0,

        sub: [
            ['subAttr1Type', 'subAttr1Value'],
            ['subAttr2Type', 'subAttr2Value'],
            ['subAttr3Type', 'subAttr3Value'],
            ['subAttr4Type', 'subAttr4Value']
        ].map(([t, v]) => ({
            type: document.getElementById(t).value,
            value: parseFloat(document.getElementById(v).value) || 0
        }))
    };
}

/* =========================
   主属性评分
========================= */
function calcMainScore(data, weights) {
    const maxMap = {
        "攻击+":22,"防御+":22,"HP+":37,
        "攻击%":25,"防御%":25,"HP%":25,
        "暴击%":27,"暴伤%":40.8,"自我意识恢复":40
    };

    const w = weights.mainAttr[data.mainType] || 0.5;
    const max = maxMap[data.mainType] || 1;

    return (data.mainVal / max) * 30 * w;
}

/* =========================
   副词条评分
========================= */
function calcSubScore(data, weights) {
    const maxMap = {
        "攻击+":8,"防御+":5,"HP+":12,
        "攻击%":1.3,"防御%":1.3,"HP%":1.3,
        "暴击%":2,"暴伤%":4,
        "自我意识恢复":5,
        "额外伤害%":3.4,"持续伤害%":3.4
    };

    let score = 0;

    data.sub.forEach(s => {
        if (!s.type || !maxMap[s.type]) return;

        const w = weights.subAttr[s.type] || 0.3;
        score += (s.value / maxMap[s.type]) * 7.5 * w;
    });

    return score;
}

/* =========================
   等级系统
========================= */
function calcRank(rate) {
    if (rate >= 95) return "T0";
    if (rate >= 85) return "T1";
    if (rate >= 70) return "T2";
    if (rate >= 55) return "T3";
    return "普通";
}

/* =========================
   UI渲染
========================= */
function renderResult({ total, rate, rank }) {
    document.getElementById('resultDisplay').style.display = 'block';

    document.getElementById('scoreValue').textContent = total;
    document.getElementById('scoreRank').textContent = rank;
    document.getElementById('progressFill').style.width = rate + '%';
    document.getElementById('graduationRate').textContent = rate + '%';
    document.getElementById('totalPoints').textContent = total;
}

/* =========================
   保存数据
========================= */
function saveFragment(data) {
    const p = getUrlParams();
    const list = Storage.get('myCharacters');

    const idx = list.findIndex(x => x.id === p.id && x.self === p.self);

    if (idx === -1) {
        alert("⚠️ 角色不存在！");
        return;
    }

    const char = list[idx];

    if (!char.fragments) char.fragments = [];
    if (char.fragments.length >= 6) {
        alert("碎片已满6个");
        return;
    }

    char.fragments.push({
        part: currentPart,
        ...data
    });

    list[idx] = char;
    Storage.set('myCharacters', list);

    alert("✅ 保存成功");
}