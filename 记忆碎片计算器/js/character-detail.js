// DOM缓存 - 修复：使用每次都获取最新元素，避免缓存问题
const getDOM = (id) => {
    return document.getElementById(id);
};

// 数据缓存
let currentCharacter = null;
let allCharacters = CHARACTERS_DATA.characters;

// 碎片属性映射表
const attrMapping = {
    "攻击+": "攻击百分比",
    "防御+": "防御百分比",
    "HP+": "生命值百分比",
    "攻击%": "攻击百分比",
    "防御%": "防御百分比",
    "HP%": "生命值百分比",
    "暴击%": "暴击率",
    "暴伤%": "暴击伤害",
    "自我意识恢复": "充能效率",
    "额外伤害%": "元素伤害",
    "持续伤害%": "元素伤害"
};

// 部位映射表
const partMapping = {
    impact: "花",
    suppress: "羽",
    deny: "沙",
    ideal: "杯",
    desire: "头",
    imagine: "花"
};

// 转换碎片数据为评分系统格式
function convertFragmentToArtifact(frag) {
    if (!frag || !frag.mainAttr) return null;
    
    const subAttrs = [];
    const subTypes = ['sub1Type', 'sub2Type', 'sub3Type', 'sub4Type'];
    const subVals = ['sub1Val', 'sub2Val', 'sub3Val', 'sub4Val'];
    
    for (let i = 0; i < 4; i++) {
        const type = frag[subTypes[i]];
        const val = frag[subVals[i]];
        if (type && val) {
            subAttrs.push({
                name: attrMapping[type] || type,
                value: val
            });
        }
    }
    
    return {
        position: partMapping[frag.part] || "花",
        mainAttr: attrMapping[frag.mainAttr] || frag.mainAttr,
        mainValue: frag.mainValue,
        subAttrs: subAttrs
    };
}

// 部位名翻译表
const partNameMap = {
    impact: "冲击",
    suppress: "压抑",
    deny: "否定",
    ideal: "理想",
    desire: "渴望",
    imagine: "想像"
};

// 单个碎片分数计算（优化：内联函数，避免重复调用）
function calcOneFragmentScore(frag) {
    if (!frag || !frag.mainAttr || !frag.mainValue) return 0;

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

    const mainVal = parseFloat(frag.mainValue);
    const mainMax = mainMaxMap[frag.mainAttr];
    if (!mainMax) return 0;
    
    let mainScore = (mainVal / mainMax) * 40;
    let subScore = 0;

    // 优化：减少属性查找次数
    const attrs = ['sub1Type', 'sub2Type', 'sub3Type', 'sub4Type'];
    const vals = ['sub1Val', 'sub2Val', 'sub3Val', 'sub4Val'];
    
    for (let i = 0; i < 4; i++) {
        const type = frag[attrs[i]];
        const val = parseFloat(frag[vals[i]]);
        if (type && val && subMaxMap[type]) {
            subScore += (val / subMaxMap[type]) * 15;
        }
    }

    return Math.round(mainScore + subScore);
}

// 渲染角色信息
function renderCharacterInfo() {
    const base = allCharacters.find(x => x.id === currentCharacter.id);
    if (!base) return;
    
    const imgEl = document.getElementById('charImage');
    const nameEl = document.getElementById('charName');
    const infoEl = document.getElementById('charInfo');
    
    if (imgEl) {
        // 设置图片
        imgEl.src = base.image || '';
        
        // 添加图片加载失败处理
        imgEl.onerror = function() {
            // 图片加载失败时，显示角色名字首字母
            imgEl.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.width = '100%';
            placeholder.style.height = '100%';
            placeholder.style.borderRadius = '50%';
            placeholder.style.background = 'linear-gradient(135deg, #00d4ff, #9933ff)';
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.fontSize = '48px';
            placeholder.style.fontWeight = 'bold';
            placeholder.style.color = '#fff';
            placeholder.textContent = currentCharacter.name.charAt(0);
            imgEl.parentElement.appendChild(placeholder);
        };
    }
    if (nameEl) {
        nameEl.textContent = currentCharacter.name;
    }
    if (infoEl) {
        infoEl.textContent = `自我意识 ${currentCharacter.self} · Lv.${currentCharacter.level}`;
    }
}

// 渲染碎片列表
function renderFragments() {
    const frags = currentCharacter.fragments;
    const dom = getDOM('fragmentStatus');
    if (!dom) return;

    // 优化：使用数组join代替多次innerHTML
    const items = [];
    
    for (let i = 0; i < 6; i++) {
        const frag = frags[i];
        if (frag) {
            const partName = partNameMap[frag.part] || frag.part;
            const score = calcOneFragmentScore(frag);
            
            items.push(`
            <div class="fragment-item">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span>碎片${i+1}：${partName}</span>
                    <span style="color:var(--accent);font-weight:600;">${score}分</span>
                </div>
                <div style="font-size:13px;color:var(--text-secondary);">
                    ${frag.mainAttr} ${frag.mainValue}
                    ${frag.sub1Type ? ` | ${frag.sub1Type} ${frag.sub1Val}` : ''}
                    ${frag.sub2Type ? ` | ${frag.sub2Type} ${frag.sub2Val}` : ''}
                    ${frag.sub3Type ? ` | ${frag.sub3Type} ${frag.sub3Val}` : ''}
                    ${frag.sub4Type ? ` | ${frag.sub4Type} ${frag.sub4Val}` : ''}
                </div>
            </div>`);
        } else {
            items.push(`
            <div class="fragment-item fragment-empty">
                碎片${i+1}：未录入
            </div>`);
        }
    }
    
    dom.innerHTML = items.join('');
}

// 汇总计算6个碎片（使用新评分系统）
function calculateTotalScore() {
    const frags = currentCharacter.fragments;
    if (!Array.isArray(frags) || frags.length === 0) {
        alert("还没有录入任何碎片数据！");
        return;
    }

    // 获取角色类型选择
    const charType = getDOM('charTypeSelect')?.value || 'DPS';
    
    // 转换碎片数据格式
    const artifacts = frags.map(frag => convertFragmentToArtifact(frag)).filter(Boolean);
    
    // 使用新评分系统计算
    const result = ArtifactScoring.calculateSetScore(artifacts, charType);
    
    // 显示评分结果
    displayScoreResult(result);
    
    // 显示养成建议
    displaySuggestions(result.suggestions);
    
    // 保存结果到本地存储
    const resultData = {
        totalScore: result.totalScore,
        avgScore: result.avgScore,
        graduationRate: result.graduationRate,
        rank: getRank(result.graduationRate),
        status: result.status,
        time: new Date().toLocaleString(),
        fragments: JSON.parse(JSON.stringify(frags))
    };
    
    // 使用Storage.set以利用缓存机制
    Storage.set('lastResult', resultData);
}

// 显示评分结果
function displayScoreResult(result) {
    const scoreResult = getDOM('scoreResult');
    if (!scoreResult) return;
    
    getDOM('totalScore').textContent = result.totalScore;
    getDOM('avgScore').textContent = result.avgScore;
    getDOM('graduationRate').textContent = result.graduationRate + '%';
    
    const statusEl = getDOM('graduationStatus');
    statusEl.textContent = result.status.level;
    statusEl.style.backgroundColor = result.status.color + '20';
    statusEl.style.color = result.status.color;
    
    scoreResult.style.display = 'block';
}

// 显示养成建议
function displaySuggestions(suggestions) {
    const suggestionsDiv = getDOM('suggestions');
    const listEl = getDOM('suggestionList');
    if (!suggestionsDiv || !listEl) return;
    
    if (!suggestions || suggestions.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    const typeStyles = {
        warning: { bg: 'rgba(255, 100, 100, 0.15)', color: '#ff6464', icon: '⚠' },
        info: { bg: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', icon: 'ℹ' },
        tip: { bg: 'rgba(255, 215, 0, 0.15)', color: '#ffd700', icon: '💡' },
        success: { bg: 'rgba(0, 255, 136, 0.15)', color: '#00ff88', icon: '✓' }
    };
    
    listEl.innerHTML = suggestions.map(s => {
        const style = typeStyles[s.type] || typeStyles.info;
        return `
        <div style="padding: 10px; margin-bottom: 8px; border-radius: 8px; background: ${style.bg}; display: flex; align-items: flex-start;">
            <span style="margin-right: 8px; font-size: 16px;">${style.icon}</span>
            <span style="color: ${style.color}; font-size: 13px;">${s.text}</span>
        </div>`;
    }).join('');
    
    suggestionsDiv.style.display = 'block';
}

// 获取评级
function getRank(graduationRate) {
    if (graduationRate >= 100) return 'SSS';
    if (graduationRate >= 90) return 'SS';
    if (graduationRate >= 75) return 'S';
    if (graduationRate >= 60) return 'A';
    return '普通';
}

// DOMContentLoaded时执行
function init() {
    console.log('=== init 函数开始执行 ===');
    
    try {
        const params = getUrlParams();
        console.log('URL参数:', params);
        
        if (!params || !params.id || !params.self) {
            console.error('参数错误:', params);
            alert('参数错误，请从角色列表进入');
            navigateTo('characters.html');
            return;
        }
        
        // 使用缓存的Storage.get
        const list = Storage.get('myCharacters');
        console.log('角色列表:', list);
        
        currentCharacter = list.find(x => x.id === params.id && x.self === params.self);
        console.log('找到的角色:', currentCharacter);

        if (!currentCharacter) {
            console.error('角色不存在，列表:', list);
            alert('角色不存在，请重新创建');
            navigateTo('characters.html');
            return;
        }

        // 强制初始化碎片数组
        if (!Array.isArray(currentCharacter.fragments)) {
            currentCharacter.fragments = [];
        }

        renderCharacterInfo();
        renderFragments();

        // 绑定跳转按钮（必须在DOM加载完成后绑定）
        bindAddFragmentBtn();
        
        console.log('=== init 函数执行完成 ===');
    } catch (e) {
        console.error('init 函数执行出错:', e);
        alert('初始化失败，请刷新页面重试');
    }
}

// 绑定添加碎片按钮
function bindAddFragmentBtn() {
    console.log('=== bindAddFragmentBtn 开始执行 ===');
    
    const addBtn = document.getElementById('addFragmentBtn');
    console.log('按钮元素:', addBtn);
    console.log('currentCharacter:', currentCharacter);
    
    if (!addBtn) {
        console.error('添加碎片按钮未找到');
        // 延迟重试
        setTimeout(bindAddFragmentBtn, 100);
        return;
    }
    if (!currentCharacter) {
        console.error('当前角色为空');
        return;
    }
    
    // 确保移除所有旧的监听器
    addBtn.removeEventListener('click', handleAddFragmentClick);
    
    // 添加新的监听器
    addBtn.addEventListener('click', handleAddFragmentClick);
    console.log('=== 按钮绑定成功 ===');
}

// 添加碎片点击处理函数
function handleAddFragmentClick() {
    console.log('=== handleAddFragmentClick 被调用 ===');
    
    if (!currentCharacter) {
        console.error('当前角色为空');
        alert('角色数据丢失，请重新进入');
        window.location.href = 'characters.html';
        return;
    }
    
    console.log('跳转参数:', { id: currentCharacter.id, self: currentCharacter.self });
    console.log('准备跳转...');
    
    const url = 'calculator.html?id=' + encodeURIComponent(currentCharacter.id) + '&self=' + encodeURIComponent(currentCharacter.self);
    console.log('跳转URL:', url);
    
    // 使用 setTimeout 确保当前事件循环完成
    setTimeout(function() {
        window.location.href = url;
    }, 0);
}

document.addEventListener('DOMContentLoaded', init);