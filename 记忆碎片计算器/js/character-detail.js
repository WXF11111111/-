let currentCharacter = null;
let allCharacters = CHARACTERS_DATA.characters;

/* =========================
   基础数据
========================= */
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

const partNameMap = {
    impact: "冲击",
    suppress: "压抑",
    deny: "否定",
    ideal: "理想",
    desire: "渴望",
    imagine: "想像"
};

/* =========================
   初始化
========================= */
document.addEventListener('DOMContentLoaded', () => {
    initCharacter();
    render();
});

/* =========================
   初始化角色
========================= */
function initCharacter() {
    const p = getUrlParams();
    const list = Storage.get('myCharacters');

    currentCharacter = list.find(x => x.id === p.id && x.self === p.self);

    if (!currentCharacter.fragments) {
        currentCharacter.fragments = [];
    }
}

/* =========================
   渲染入口
========================= */
function render() {
    renderCharacterInfo();
    renderFragments();
}

/* =========================
   角色信息
========================= */
function renderCharacterInfo() {
    const base = allCharacters.find(x => x.id === currentCharacter.id);

    document.getElementById('charImage').src = base?.image || '';
    document.getElementById('charName').textContent = currentCharacter.name;
    document.getElementById('charInfo').textContent =
        `自我意识 ${currentCharacter.self} · Lv.${currentCharacter.level}`;
}

/* =========================
   碎片列表
========================= */
function renderFragments() {
    const dom = document.getElementById('fragmentStatus');
    dom.innerHTML = '';

    const frags = currentCharacter.fragments;

    for (let i = 0; i < 6; i++) {
        const frag = frags[i];

        if (frag) {
            dom.appendChild(createFragmentCard(i, frag));
        } else {
            dom.appendChild(createEmptyCard(i));
        }
    }
}

/* =========================
   单个碎片卡片
========================= */
function createFragmentCard(index, frag) {
    const div = document.createElement('div');

    const partName = partNameMap[frag.part] || frag.part;
    const score = calcFragmentScore(frag);

    div.className = "frag-card filled";
    div.innerHTML = `
        碎片${index + 1}：${partName}
        ｜ ${frag.mainAttr} ${frag.mainValue}
        ｜ 分数：${score}
    `;

    return div;
}

/* =========================
   空卡片
========================= */
function createEmptyCard(index) {
    const div = document.createElement('div');

    div.className = "frag-card empty";
    div.innerHTML = `碎片${index + 1}：未录入`;

    return div;
}

/* =========================
   单碎片评分（核心统一函数）
========================= */
function calcFragmentScore(frag) {
    const mainScore =
        (frag.mainValue / (mainMaxMap[frag.mainAttr] || 1)) * 40;

    let subScore = 0;

    const subs = [
        [frag.sub1Type, frag.sub1Val],
        [frag.sub2Type, frag.sub2Val],
        [frag.sub3Type, frag.sub3Val],
        [frag.sub4Type, frag.sub4Val]
    ];

    subs.forEach(([type, val]) => {
        if (!type || !subMaxMap[type]) return;
        subScore += (val / subMaxMap[type]) * 15;
    });

    return Math.round(mainScore + subScore);
}

/* =========================
   添加碎片
========================= */
document.getElementById('addFragmentBtn').onclick = () => {
    navigateTo('calculator.html', {
        id: currentCharacter.id,
        self: currentCharacter.self
    });
};

/* =========================
   汇总计算
========================= */
function calculateTotalScore() {
    const frags = currentCharacter.fragments || [];

    if (frags.length === 0) {
        alert("还没有碎片数据");
        return;
    }

    const totalScore = frags.reduce((sum, f) => {
        return sum + calcFragmentScore(f);
    }, 0);

    const graduationRate = Math.round((totalScore / 600) * 100);

    const rank = calcRank(graduationRate);

    const resultData = {
        totalScore,
        graduationRate,
        rank,
        time: new Date().toLocaleString(),
        fragments: JSON.parse(JSON.stringify(frags))
    };

    Storage.set('lastResult', resultData);

    navigateTo('result.html', {
        id: currentCharacter.id,
        self: currentCharacter.self
    });
}

/* =========================
   等级系统（统一）
========================= */
function calcRank(rate) {
    if (rate >= 100) return "SSS";
    if (rate >= 90) return "SS";
    if (rate >= 75) return "S";
    if (rate >= 60) return "A";
    return "普通";
}