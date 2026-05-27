// ============================================
// 记忆碎片评分系统
// 支持：攻击输出(DPS)、防御输出(DEF)、治疗辅助(SUPPORT)
// 6个部位：冲击/左一、压抑/左二、否定/左三、理想/右一、渴望/右二、想像/右三
// ============================================

const ArtifactScoring = (function() {
    // ====================
    // 部位配置
    // ====================
    const PART_CONFIG = {
        'impact': { name: '冲击/左一', mainAttrs: ['攻击+'] },
        'suppress': { name: '压抑/左二', mainAttrs: ['防御+'] },
        'deny': { name: '否定/左三', mainAttrs: ['HP+'] },
        'ideal': { name: '理想/右一', mainAttrs: ['攻击%', 'HP%', '暴击%', '暴伤%'] },
        'desire': { name: '渴望/右二', mainAttrs: ['攻击%', 'HP%', '热情属性伤害%', '正义属性伤害%', '秩序属性伤害%', '虚无属性伤害%', '本能属性伤害%'] },
        'imagine': { name: '想像/右三', mainAttrs: ['攻击%', '防御%', 'HP%', '自我意识恢复'] }
    };
    
    // ====================
    // 主属性权重 (每个部位的主属性权重)
    // ====================
    const MAIN_ATTR_WEIGHTS = {
        DPS: {
            'impact': { '攻击+': 1.0 },
            'suppress': { '防御+': 0.3 },
            'deny': { 'HP+': 0.2 },
            'ideal': { '攻击%': 1.0, 'HP%': 0.3, '暴击%': 1.2, '暴伤%': 1.1 },
            'desire': { '攻击%': 1.0, 'HP%': 0.2, '热情属性伤害%': 1.3, '正义属性伤害%': 1.3, '秩序属性伤害%': 1.3, '虚无属性伤害%': 1.3, '本能属性伤害%': 1.3 },
            'imagine': { '攻击%': 0.8, '防御%': 0.2, 'HP%': 0.2, '自我意识恢复': 0.4 }
        },
        DEF: {
            'impact': { '攻击+': 0.5 },
            'suppress': { '防御+': 1.2 },
            'deny': { 'HP+': 0.8 },
            'ideal': { '攻击%': 0.5, 'HP%': 0.6, '暴击%': 1.0, '暴伤%': 0.8 },
            'desire': { '攻击%': 0.4, 'HP%': 0.7, '热情属性伤害%': 0.8, '正义属性伤害%': 0.8, '秩序属性伤害%': 0.8, '虚无属性伤害%': 0.8, '本能属性伤害%': 0.8 },
            'imagine': { '攻击%': 0.3, '防御%': 1.0, 'HP%': 0.5, '自我意识恢复': 0.9 }
        },
        SUPPORT: {
            'impact': { '攻击+': 0.3 },
            'suppress': { '防御+': 1.1 },
            'deny': { 'HP+': 1.0 },
            'ideal': { '攻击%': 0.3, 'HP%': 0.8, '暴击%': 0.3, '暴伤%': 0.2 },
            'desire': { '攻击%': 0.2, 'HP%': 0.9, '热情属性伤害%': 0.5, '正义属性伤害%': 0.5, '秩序属性伤害%': 0.5, '虚无属性伤害%': 0.5, '本能属性伤害%': 0.5 },
            'imagine': { '攻击%': 0.2, '防御%': 0.8, 'HP%': 0.7, '自我意识恢复': 1.0 }
        }
    };
    
    // ====================
    // 副词条权重
    // ====================
    const SUB_ATTR_WEIGHTS = {
        DPS: {
            '攻击+': 1.0,
            '防御+': 0.3,
            'HP+': 0.2,
            '攻击%': 0.8,
            '防御%': 0.2,
            'HP%': 0.2,
            '暴击%': 1.2,
            '暴伤%': 1.1,
            '自我意识恢复': 0.4,
            '额外伤害%': 1.0,
            '持续伤害%': 1.0
        },
        DEF: {
            '攻击+': 0.5,
            '防御+': 1.2,
            'HP+': 0.7,
            '攻击%': 0.4,
            '防御%': 0.8,
            'HP%': 0.5,
            '暴击%': 0.9,
            '暴伤%': 0.7,
            '自我意识恢复': 0.9,
            '额外伤害%': 0.8,
            '持续伤害%': 0.8
        },
        SUPPORT: {
            '攻击+': 0.3,
            '防御+': 1.0,
            'HP+': 0.8,
            '攻击%': 0.2,
            '防御%': 0.7,
            'HP%': 0.6,
            '暴击%': 0.3,
            '暴伤%': 0.2,
            '自我意识恢复': 1.0,
            '额外伤害%': 0.3,
            '持续伤害%': 0.3
        }
    };
    
    // ====================
    // 属性最大值参考 (强化5级或副词条最大值)
    // ====================
    const ATTR_MAX_VALUES = {
        // 主属性最大值（强化5级）
        '攻击+': 22,
        '防御+': 22,
        'HP+': 37,
        '攻击%': 25,
        '防御%': 25,
        'HP%': 25,
        '暴击%': 27,
        '暴伤%': 40.8,
        '自我意识恢复': 40,
        '热情属性伤害%': 16,
        '正义属性伤害%': 16,
        '秩序属性伤害%': 16,
        '虚无属性伤害%': 16,
        '本能属性伤害%': 16,
        
        // 副词条最大值
        'sub_攻击+': 8,
        'sub_防御+': 5,
        'sub_HP+': 12,
        'sub_攻击%': 1.3,
        'sub_防御%': 1.3,
        'sub_HP%': 1.3,
        'sub_暴击%': 2.0,
        'sub_暴伤%': 4.0,
        'sub_自我意识恢复': 5,
        'sub_额外伤害%': 3.4,
        'sub_持续伤害%': 3.4
    };
    
    // ====================
    // 核心评分算法
    // ====================
    
    /**
     * 计算单个记忆碎片分数
     * @param {Object} fragment - 碎片数据
     * @param {string} charType - 角色类型: DPS/DEF/SUPPORT
     * @returns {number} 分数 (0-100)
     */
    function calculateFragmentScore(fragment, charType) {
        if (!fragment || !fragment.mainAttr || !fragment.mainValue) return 0;
        
        let score = 0;
        const mainWeights = MAIN_ATTR_WEIGHTS[charType];
        const subWeights = SUB_ATTR_WEIGHTS[charType];
        
        // 主属性评分 (0-60分)
        const part = fragment.part || 'impact';
        const mainAttr = fragment.mainAttr;
        const mainValue = parseFloat(fragment.mainValue) || 0;
        
        if (mainWeights[part] && mainWeights[part][mainAttr]) {
            const weight = mainWeights[part][mainAttr];
            const maxValue = ATTR_MAX_VALUES[mainAttr] || 100;
            const normalized = Math.min(mainValue / maxValue, 1);
            score += normalized * weight * 60; // 主属性最高60分
        }
        
        // 副词条评分 (0-40分)
        let subTotal = 0;
        let subCount = 0;
        
        // 处理副词条
        const subAttrs = [];
        const subTypes = ['sub1Type', 'sub2Type', 'sub3Type', 'sub4Type'];
        const subVals = ['sub1Val', 'sub2Val', 'sub3Val', 'sub4Val'];
        
        for (let i = 0; i < 4; i++) {
            const type = fragment[subTypes[i]];
            const val = parseFloat(fragment[subVals[i]]) || 0;
            if (type && val > 0) {
                subAttrs.push({ name: type, value: val });
            }
        }
        
        subAttrs.forEach(sub => {
            const attrName = sub.name;
            const attrValue = parseFloat(sub.value) || 0;
            
            if (subWeights[attrName]) {
                const weight = subWeights[attrName];
                const maxValue = ATTR_MAX_VALUES['sub_' + attrName] || ATTR_MAX_VALUES[attrName] || 100;
                const normalized = Math.min(attrValue / maxValue, 1);
                subTotal += normalized * weight;
                subCount++;
            }
        });
        
        // 副词条平均得分，最高40分
        if (subCount > 0) {
            score += Math.min((subTotal / subCount) * 20, 40);
        }
        
        return Math.round(score);
    }
    
    /**
     * 计算套装总分
     * @param {Array} fragments - 碎片数组 (最多6个)
     * @param {string} charType - 角色类型
     * @returns {Object} 评分结果
     */
    function calculateSetScore(fragments, charType) {
        const validFragments = fragments.filter(f => f && f.mainAttr);
        const totalScore = validFragments.reduce((sum, fragment) => 
            sum + calculateFragmentScore(fragment, charType), 0);
        const avgScore = validFragments.length > 0 ? Math.round(totalScore / validFragments.length) : 0;
        const graduationRate = Math.round((totalScore / 600) * 100); // 6个碎片最高600分
        
        // 统计属性分布
        const stats = analyzeStats(validFragments, charType);
        
        // 判断毕业状态
        const status = getGraduationStatus(avgScore, stats, charType);
        
        // 生成养成建议
        const suggestions = generateSuggestions(avgScore, stats, charType);
        
        return {
            totalScore,
            avgScore,
            graduationRate,
            status,
            stats,
            suggestions,
            fragmentScores: validFragments.map(f => calculateFragmentScore(f, charType))
        };
    }
    
    /**
     * 分析属性分布
     */
    function analyzeStats(fragments, charType) {
        const stats = {
            critRate: 0,
            critDmg: 0,
            atkPercent: 0,
            defPercent: 0,
            hpPercent: 0,
            er: 0,
            mainAttrMatch: 0,
            totalSubSlots: 0,
            goodSubCount: 0
        };
        
        fragments.forEach(fragment => {
            if (!fragment) return;
            
            // 主属性匹配度
            const part = fragment.part || 'impact';
            const mainAttr = fragment.mainAttr;
            const recommended = PART_CONFIG[part]?.mainAttrs || [];
            if (recommended.includes(mainAttr)) {
                stats.mainAttrMatch++;
            }
            
            // 统计属性数值
            const mainVal = parseFloat(fragment.mainValue) || 0;
            if (mainAttr === '暴击%') stats.critRate += mainVal;
            if (mainAttr === '暴伤%') stats.critDmg += mainVal;
            if (mainAttr === '攻击%') stats.atkPercent += mainVal;
            if (mainAttr === '防御%') stats.defPercent += mainVal;
            if (mainAttr === 'HP%') stats.hpPercent += mainVal;
            if (mainAttr === '自我意识恢复') stats.er += mainVal;
            
            // 副词条统计
            const subAttrs = [];
            const subTypes = ['sub1Type', 'sub2Type', 'sub3Type', 'sub4Type'];
            const subVals = ['sub1Val', 'sub2Val', 'sub3Val', 'sub4Val'];
            
            for (let i = 0; i < 4; i++) {
                const type = fragment[subTypes[i]];
                const val = parseFloat(fragment[subVals[i]]) || 0;
                if (type && val > 0) {
                    subAttrs.push({ name: type, value: val });
                    
                    // 统计副词条属性
                    if (type === '暴击%') stats.critRate += val;
                    if (type === '暴伤%') stats.critDmg += val;
                    if (type === '攻击%') stats.atkPercent += val;
                    if (type === '防御%') stats.defPercent += val;
                    if (type === 'HP%') stats.hpPercent += val;
                    if (type === '自我意识恢复') stats.er += val;
                }
            }
            
            stats.totalSubSlots += subAttrs.length;
            
            const goodSubs = SUB_ATTR_WEIGHTS[charType];
            subAttrs.forEach(sub => {
                if (goodSubs[sub.name] && goodSubs[sub.name] >= 0.8) {
                    stats.goodSubCount++;
                }
            });
        });
        
        return stats;
    }
    
    /**
     * 判断毕业状态
     */
    function getGraduationStatus(avgScore, stats, charType) {
        if (avgScore >= 90) return { level: '毕业', desc: '恭喜！你的记忆碎片已经毕业', color: '#00ff88' };
        if (avgScore >= 80) return { level: '接近毕业', desc: '差一点就毕业了', color: '#00d4ff' };
        if (avgScore >= 65) return { level: '小成', desc: '继续努力，已经很不错了', color: '#ffd700' };
        if (avgScore >= 50) return { level: '成长中', desc: '还有很大提升空间', color: '#ff9500' };
        return { level: '新手', desc: '需要更多好碎片', color: '#ff4444' };
    }
    
    /**
     * 生成养成建议
     */
    function generateSuggestions(avgScore, stats, charType) {
        const suggestions = [];
        
        // 暴击相关建议
        if (charType === 'DPS') {
            if (stats.critRate < 50) {
                suggestions.push({ type: 'warning', text: `暴击率偏低(${stats.critRate.toFixed(1)}%)，建议优先堆暴击率至50%以上` });
            } else if (stats.critRate > 70) {
                suggestions.push({ type: 'info', text: `暴击率充足(${stats.critRate.toFixed(1)}%)，可以考虑堆暴击伤害` });
            }
            
            const critRatio = stats.critDmg / (stats.critRate || 1);
            if (critRatio < 2) {
                suggestions.push({ type: 'tip', text: `暴伤/暴击率比值(${critRatio.toFixed(1)})偏低，理想比值约2:1` });
            }
        }
        
        // 主属性匹配建议
        const matchRate = stats.mainAttrMatch / 6 * 100;
        if (matchRate < 80) {
            suggestions.push({ type: 'warning', text: `主属性匹配度(${matchRate.toFixed(0)}%)较低，建议更换不匹配的碎片` });
        }
        
        // 副词条质量建议
        const subQuality = stats.totalSubSlots > 0 ? (stats.goodSubCount / stats.totalSubSlots * 100) : 0;
        if (subQuality < 50) {
            suggestions.push({ type: 'info', text: `副词条质量(${subQuality.toFixed(0)}%)一般，建议刷取更多碎片` });
        }
        
        // 自我意识恢复建议
        if (charType === 'SUPPORT' && stats.er < 30) {
            suggestions.push({ type: 'warning', text: `自我意识恢复(${stats.er})偏低，建议提升` });
        }
        
        // 防御角色建议
        if (charType === 'DEF' && stats.defPercent < 20) {
            suggestions.push({ type: 'info', text: `防御百分比(${stats.defPercent}%)可以继续提升` });
        }
        
        // 鼓励建议
        if (avgScore >= 80) {
            suggestions.push({ type: 'success', text: '碎片品质很高，继续保持！' });
        } else if (avgScore < 50) {
            suggestions.push({ type: 'tip', text: '建议先提升角色等级和天赋，同时刷取更多碎片' });
        }
        
        return suggestions;
    }
    
    /**
     * 获取推荐词条
     */
    function getRecommendedAttributes(charType) {
        const weights = SUB_ATTR_WEIGHTS[charType];
        return Object.entries(weights)
            .filter(([, weight]) => weight >= 0.8)
            .map(([name]) => name);
    }
    
    /**
     * 添加新角色类型
     */
    function addCharacterType(typeName, mainWeights, subWeights) {
        MAIN_ATTR_WEIGHTS[typeName] = mainWeights;
        SUB_ATTR_WEIGHTS[typeName] = subWeights;
    }
    
    return {
        calculateFragmentScore,
        calculateSetScore,
        getRecommendedAttributes,
        addCharacterType,
        PART_CONFIG
    };
})();