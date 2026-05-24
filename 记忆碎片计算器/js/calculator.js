let fragmentRules = FRAGMENT_RULES;
let allCharacters = CHARACTERS_DATA.characters;
let currentCharacter = null;
let currentPart = 'impact';

document.addEventListener('DOMContentLoaded', () => {
    const p = getUrlParams();
    if (p.id && p.self) {
        const list = Storage.get('myCharacters');
        currentCharacter = list.find(x => x.id === p.id && x.self === p.self);
    }
    initPartTabs();
    updateMainAttrOptions();
    updateSubAttrOptions();
});

function initPartTabs() {
    document.querySelectorAll('.part-tab').forEach(t => {
        t.onclick = () => {
            document.querySelectorAll('.part-tab').forEach(x => x.classList.remove('active'));
            t.classList.add('active');
            currentPart = t.dataset.part;
            updateMainAttrOptions();
        };
    });
}

function updateMainAttrOptions() {
    const s = document.getElementById('mainAttrSelect');
    s.innerHTML = '';
    const attrs = fragmentRules.mainAttrs[currentPart]?.attrs || [];
    attrs.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        s.appendChild(opt);
    });
}

function updateSubAttrOptions() {
    const keys = Object.keys(fragmentRules.subAttrs);
    const list = [
        document.getElementById('subAttr1Type'),
        document.getElementById('subAttr2Type'),
        document.getElementById('subAttr3Type'),
        document.getElementById('subAttr4Type')
    ];
    list.forEach(sel => {
        sel.innerHTML = '<option value="">选择副词条</option>';
        keys.forEach(k => {
            const opt = document.createElement('option');
            opt.value = k;
            opt.textContent = k;
            sel.appendChild(opt);
        });
    });
}

// 获取角色类型对应的评分权重
function getScoreWeights(charType) {
    switch(charType) {
        case 'dps': // 主C/攻击输出
            return {
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
            };
        case 'def': // 防御/反击
            return {
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
            };
        case 'support': // 奶妈/护盾/辅助
            return {
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
            };
        default:
            return {
                mainAttr: { "攻击%": 1.0, "暴击%": 1.0, "暴伤%": 1.0, "攻击+": 1.0,
                           "防御%": 1.0, "防御+": 1.0, "HP%": 1.0, "HP+": 1.0, "自我意识恢复": 1.0 },
                subAttr: { "攻击+": 1.0, "防御+": 1.0, "HP+": 1.0, "攻击%": 1.0, "防御%": 1.0, "HP%": 1.0,
                           "暴击%": 1.0, "暴伤%": 1.0, "自我意识恢复": 1.0, "额外伤害%": 1.0, "持续伤害%": 1.0 }
            };
    }
}

function calculateScore() {
    const mainType = document.getElementById('mainAttrSelect').value;
    const mainVal = parseFloat(document.getElementById('mainAttrValue').value) || 0;

    const s1Type = document.getElementById('subAttr1Type').value;
    const s1Val = parseFloat(document.getElementById('subAttr1Value').value) || 0;
    const s2Type = document.getElementById('subAttr2Type').value;
    const s2Val = parseFloat(document.getElementById('subAttr2Value').value) || 0;
    const s3Type = document.getElementById('subAttr3Type').value;
    const s3Val = parseFloat(document.getElementById('subAttr3Value').value) || 0;
    const s4Type = document.getElementById('subAttr4Type').value;
    const s4Val = parseFloat(document.getElementById('subAttr4Value').value) || 0;

    // 获取角色类型
    const charType = currentCharacter ? 
        (allCharacters.find(c => c.id === currentCharacter.id)?.type || 'dps') : 'dps';
    const weights = getScoreWeights(charType);

    const mainMaxMap = {
        "攻击+":22,"防御+":22,"HP+":37,
        "攻击%":25,"防御%":25,"HP%":25,
        "暴击%":27,"暴伤%":40.8,"自我意识恢复":40
    };
    const subMaxMap = {
        "攻击+":8,"防御+":5,"HP+":12,
        "攻击%":1.3,"防御%":1.3,"HP%":1.3,
        "暴击%":2,"暴伤%":4,
        "自我意识恢复":5,"额外伤害%":3.4,"持续伤害%":3.4
    };

    // 主属性评分（满分30分）
    let mainScore = 0;
    if(mainMaxMap[mainType]){
        const weight = weights.mainAttr[mainType] || 0.5;
        mainScore = (mainVal / mainMaxMap[mainType]) * 30 * weight;
    }

    // 副词条评分（每个满分7.5分，总计30分）
    let subScore = 0;
    const subEntries = [[s1Type, s1Val], [s2Type, s2Val], [s3Type, s3Val], [s4Type, s4Val]];
    subEntries.forEach(([type, val]) => {
        if(type && subMaxMap[type]) {
            const weight = weights.subAttr[type] || 0.3;
            subScore += (val / subMaxMap[type]) * 7.5 * weight;
        }
    });

    let total = Math.round(mainScore + subScore);
    let rate = Math.min(100, Math.round((total / 60) * 100));

    let rank = "普通";
    if(rate>=95) rank="T0";
    else if(rate>=85) rank="T1";
    else if(rate>=70) rank="T2";
    else if(rate>=55) rank="T3";

    document.getElementById('resultDisplay').style.display = 'block';
    document.getElementById('scoreValue').textContent = total;
    document.getElementById('scoreRank').textContent = rank;
    document.getElementById('progressFill').style.width = rate + '%';
    document.getElementById('graduationRate').textContent = rate + '%';
    document.getElementById('totalPoints').textContent = total;

    // 保存碎片（关键：用p.id而不是p.charId，和common.js统一）
    const p = getUrlParams();
    const list = Storage.get('myCharacters');
    const idx = list.findIndex(x => x.id === p.id && x.self === p.self);
    if (idx === -1) {
        alert("⚠️ 角色不存在！请从角色列表点击角色进入。");
        return;
    }

    const char = list[idx];
    if (!Array.isArray(char.fragments)) char.fragments = [];
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

    list[idx] = char;
    Storage.set('myCharacters', list);
    alert("✅ 碎片保存成功！切回详情页即可看到");
}