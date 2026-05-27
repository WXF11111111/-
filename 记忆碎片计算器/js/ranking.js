// ============================================
// 排行榜系统
// 使用 localStorage 实现本地排行榜
// ============================================

// DOM缓存
let _domCache = {};
const getDOM = (id) => {
    if (!_domCache[id]) {
        _domCache[id] = document.getElementById(id);
    }
    return _domCache[id];
};

// 数据缓存
let allCharacters = CHARACTERS_DATA.characters;

// ====================
// 排行榜数据管理
// ====================

const RankingSystem = {
    STORAGE_KEY: 'fragment_ranking',
    
    // 获取排行榜数据
    getRanking() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('读取排行榜失败:', e);
            return [];
        }
    },
    
    // 保存排行榜数据
    saveRanking(ranking) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ranking));
        } catch (e) {
            console.error('保存排行榜失败:', e);
        }
    },
    
    // 添加记录到排行榜
    addRecord(record) {
        const ranking = this.getRanking();
        
        // 检查是否已存在相同记录
        const existsIndex = ranking.findIndex(
            r => r.id === record.id && r.self === record.self
        );
        
        if (existsIndex >= 0) {
            // 更新现有记录
            ranking[existsIndex] = { ...record, time: new Date().toLocaleString() };
        } else {
            // 添加新记录
            ranking.push({ ...record, time: new Date().toLocaleString() });
        }
        
        // 按总分降序排序
        ranking.sort((a, b) => b.totalScore - a.totalScore);
        
        // 只保留前20条记录
        const topRanking = ranking.slice(0, 20);
        
        this.saveRanking(topRanking);
        return topRanking;
    },
    
    // 从角色数据同步到排行榜
    syncFromCharacters() {
        const characters = Storage.get('myCharacters');
        const ranking = this.getRanking();
        
        characters.forEach(char => {
            if (char.fragments && char.fragments.length > 0) {
                // 计算总分和毕业率
                const totalScore = char.fragments.reduce((sum, frag) => {
                    return sum + calcFragmentScore(frag);
                }, 0);
                
                const avgScore = Math.round(totalScore / char.fragments.length);
                const graduationRate = Math.round((totalScore / (char.fragments.length * 100)) * 100);
                
                // 添加到排行榜
                this.addRecord({
                    id: char.id,
                    name: char.name,
                    self: char.self,
                    level: char.level,
                    totalScore,
                    avgScore,
                    graduationRate,
                    fragmentCount: char.fragments.length
                });
            }
        });
    },
    
    // 清空排行榜
    clearRanking() {
        this.saveRanking([]);
    }
};

// 单个碎片评分计算
function calcFragmentScore(frag) {
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
    
    let mainScore = (mainVal / mainMax) * 60;
    let subScore = 0;

    const attrs = ['sub1Type', 'sub2Type', 'sub3Type', 'sub4Type'];
    const vals = ['sub1Val', 'sub2Val', 'sub3Val', 'sub4Val'];
    
    for (let i = 0; i < 4; i++) {
        const type = frag[attrs[i]];
        const val = parseFloat(frag[vals[i]]);
        if (type && val && subMaxMap[type]) {
            subScore += (val / subMaxMap[type]) * 10;
        }
    }

    return Math.round(mainScore + subScore);
}

// ====================
// UI渲染
// ====================

// 渲染排行榜
function renderRanking() {
    const ranking = RankingSystem.getRanking();
    const container = getDOM('rankingList');
    
    if (!container) return;
    
    if (ranking.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <div style="font-size: 16px; margin-bottom: 8px;">暂无排行记录</div>
                <div style="font-size: 13px;">添加角色并录入碎片后将自动上榜</div>
            </div>
        `;
        return;
    }
    
    const html = ranking.map((record, index) => `
        <div class="rank-card">
            <div class="rank-header">
                <div class="rank-badge">${index + 1}</div>
                <div class="char-info">
                    <div class="char-name">${record.name}</div>
                    <div class="char-detail">自我意识 ${record.self} · Lv.${record.level} · ${record.fragmentCount}/6碎片</div>
                </div>
            </div>
            <div class="rank-stats">
                <div class="stat-item">
                    <div class="stat-value">${record.totalScore}</div>
                    <div class="stat-label">总分</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${record.avgScore}</div>
                    <div class="stat-label">平均分</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${record.graduationRate}%</div>
                    <div class="stat-label">毕业率</div>
                </div>
            </div>
            <div class="rank-time">${record.time}</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// 刷新排行榜
function refreshRanking() {
    RankingSystem.syncFromCharacters();
    renderRanking();
}

// DOMContentLoaded时执行
document.addEventListener('DOMContentLoaded', () => {
    // 同步角色数据到排行榜
    RankingSystem.syncFromCharacters();
    // 渲染排行榜
    renderRanking();
});

// 导出到全局
window.RankingSystem = RankingSystem;
window.refreshRanking = refreshRanking;