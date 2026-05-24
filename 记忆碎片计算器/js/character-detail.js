let currentCharacter = null;
let allCharacters = CHARACTERS_DATA.characters;

// 评分基准（和计算器保持一致）
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

// 部位名翻译表
const partNameMap = {
    impact: "冲击",
    suppress: "压抑",
    deny: "否定",
    ideal: "理想",
    desire: "渴望",
    imagine: "想像"
};

document.addEventListener('DOMContentLoaded', () => {
    const p = getUrlParams();
    const list = Storage.get('myCharacters');
    currentCharacter = list.find(x => x.id === p.id && x.self === p.self);

    // 强制初始化碎片数组
    if (!Array.isArray(currentCharacter.fragments)) {
        currentCharacter.fragments = [];
    }

    renderCharacterInfo();
    renderFragments();
});

function renderCharacterInfo() {
    const base = allCharacters.find(x => x.id === currentCharacter.id);
    document.getElementById('charImage').src = base?.image || '';
    document.getElementById('charName').textContent = currentCharacter.name;
    document.getElementById('charInfo').textContent = `自我意识 ${currentCharacter.self} · Lv.${currentCharacter.level}`;
}

// 核心：同时显示中文部位名 + 碎片分数
function renderFragments() {
    const frags = currentCharacter.fragments;
    const dom = document.getElementById('fragmentStatus');
    dom.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        const frag = frags[i];
        if (frag) {
            // 翻译部位名
            const partName = partNameMap[frag.part] || frag.part;
            // 计算碎片分数
            const score = calcOneFragmentScore(frag);

            dom.innerHTML += `
            <div style="background:#ffffff;padding:10px;border-radius:0;margin-bottom:6px;border:1px solid #d0d0d0;color:#1a1a1a;">
                碎片${i+1}：${partName} - ${frag.mainAttr} ${frag.mainValue} ｜ 分数: ${score}
            </div>`;
        } else {
            dom.innerHTML += `
            <div style="background:#f0f0f0;padding:10px;border-radius:0;margin-bottom:6px;border:1px solid #d0d0d0;color:#6d6d6d;">
                碎片${i+1}：未录入
            </div>`;
        }
    }
}

// 跳转计算器
document.getElementById('addFragmentBtn').onclick = () => {
    navigateTo('calculator.html', { id: currentCharacter.id, self: currentCharacter.self });
};

// 单个碎片分数计算
function calcOneFragmentScore(frag) {
    if (!frag) return 0;

    const mainScore = (parseFloat(frag.mainValue) / mainMaxMap[frag.mainAttr]) * 40;
    let subScore = 0;

    if (frag.sub1Type && frag.sub1Val) subScore += (parseFloat(frag.sub1Val) / subMaxMap[frag.sub1Type]) * 15;
    if (frag.sub2Type && frag.sub2Val) subScore += (parseFloat(frag.sub2Val) / subMaxMap[frag.sub2Type]) * 15;
    if (frag.sub3Type && frag.sub3Val) subScore += (parseFloat(frag.sub3Val) / subMaxMap[frag.sub3Type]) * 15;
    if (frag.sub4Type && frag.sub4Val) subScore += (parseFloat(frag.sub4Val) / subMaxMap[frag.sub4Type]) * 15;

    return Math.round(mainScore + subScore);
}

// 汇总计算6个碎片
function calculateTotalScore() {
    let frags = currentCharacter.fragments;
    if (!Array.isArray(frags)) frags = [];

    if (frags.length === 0) {
        alert("还没有录入任何碎片数据！");
        return;
    }

    let totalScore = 0;
    frags.forEach(frag => {
        totalScore += calcOneFragmentScore(frag);
    });

    const graduationRate = Math.round((totalScore / 600) * 100);

    let rank = "普通";
    if (graduationRate >= 100) rank = "SSS";
    else if (graduationRate >= 90) rank = "SS";
    else if (graduationRate >= 75) rank = "S";
    else if (graduationRate >= 60) rank = "A";

    const resultData = {
        totalScore,
        graduationRate,
        rank,
        time: new Date().toLocaleString(),
        fragments: JSON.parse(JSON.stringify(frags))
    };
    localStorage.setItem('lastResult', JSON.stringify(resultData));

    navigateTo('result.html', { id: currentCharacter.id, self: currentCharacter.self });
}