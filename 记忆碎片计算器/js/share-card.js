// ============================================
// 评分分享卡片系统
// ============================================

const ShareCard = {
    // 角色类型样式映射
    typeStyles: {
        dps: {
            name: '攻击输出',
            icon: '⚔️',
            gradient: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
            glow: 'rgba(255, 107, 107, 0.3)',
            border: '#ff6b6b',
            bgGradient: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 142, 83, 0.1))'
        },
        def: {
            name: '防御输出',
            icon: '🛡️',
            gradient: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
            glow: 'rgba(78, 205, 196, 0.3)',
            border: '#4ecdc4',
            bgGradient: 'linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(68, 160, 141, 0.1))'
        },
        support: {
            name: '治疗辅助',
            icon: '💚',
            gradient: 'linear-gradient(135deg, #a8e6cf, #56ab2f)',
            glow: 'rgba(168, 230, 207, 0.3)',
            border: '#a8e6cf',
            bgGradient: 'linear-gradient(135deg, rgba(168, 230, 207, 0.2), rgba(86, 171, 47, 0.1))'
        }
    },
    
    // 生成分享卡片HTML
    generateCard(character) {
        if (!character || !character.fragments) return '';
        
        // 计算评分
        const totalScore = this.calculateTotalScore(character);
        const avgScore = Math.round(totalScore / character.fragments.length);
        const graduationRate = Math.round((totalScore / (character.fragments.length * 100)) * 100);
        const rating = this.getRating(graduationRate);
        
        // 获取角色数据
        const charData = this.getCharacterData(character.id);
        
        // 获取角色类型样式
        const typeStyle = this.typeStyles[charData?.type] || this.typeStyles.dps;
        
        // 生成头像HTML（优先使用图片，失败则显示首字母）
        const avatarHtml = charData?.image ? `
            <img src="${charData.image}" alt="${character.name}" 
                 onError="this.style.display='none'; this.parentElement.innerHTML='<div class=\'char-avatar-fallback\' style=\'background: ${typeStyle.gradient};\'>${character.name.charAt(0)}</div>';">
        ` : `
            <div class="char-avatar" style="background: ${typeStyle.gradient};">${character.name.charAt(0)}</div>
        `;
        
        return `
            <div class="share-card" id="shareCard">
                <!-- 背景装饰 -->
                <div class="card-bg" style="background: ${typeStyle.bgGradient};">
                    <div class="bg-gradient"></div>
                    <div class="bg-pattern"></div>
                    <div class="card-glow" style="background: radial-gradient(circle at 30% 20%, ${typeStyle.glow} 0%, transparent 40%);"></div>
                </div>
                
                <!-- 内容区域 -->
                <div class="card-content">
                    <!-- 角色信息 -->
                    <div class="char-section">
                        <div class="char-portrait">
                            ${avatarHtml}
                            <div class="portrait-frame"></div>
                            <div class="self-badge">Self ${character.self}</div>
                        </div>
                        <div class="char-info">
                            <div class="char-name">${character.name}</div>
                            <div class="char-level">Lv.${character.level}</div>
                            <div class="char-type-tag">${typeStyle.icon} ${typeStyle.name}</div>
                        </div>
                    </div>
                    
                    <!-- 分割线 -->
                    <div class="divider">
                        <div class="divider-line"></div>
                        <div class="divider-icon">⚡</div>
                        <div class="divider-line"></div>
                    </div>
                    
                    <!-- 评分展示 -->
                    <div class="score-section">
                        <div class="score-item main">
                            <div class="score-value">${totalScore}</div>
                            <div class="score-label">总分</div>
                            <div class="score-max">/ ${character.fragments.length * 100}</div>
                        </div>
                        <div class="score-item">
                            <div class="score-value">${graduationRate}%</div>
                            <div class="score-label">毕业率</div>
                        </div>
                        <div class="score-item">
                            <div class="score-value rating-${rating.toLowerCase()}">${rating}</div>
                            <div class="score-label">评级</div>
                        </div>
                    </div>
                    
                    <!-- 进度条 -->
                    <div class="progress-section">
                        <div class="progress-label">
                            <span>养成进度</span>
                            <span>${graduationRate}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${graduationRate}%"></div>
                            <div class="progress-glow"></div>
                        </div>
                    </div>
                    
                    <!-- 碎片状态 -->
                    <div class="fragments-status">
                        <div class="fragments-label">记忆碎片</div>
                        <div class="fragments-dots">
                            ${character.fragments.map((_, i) => 
                                `<div class="dot filled"></div>`
                            ).join('')}
                            ${Array(6 - character.fragments.length).fill(`<div class="dot empty"></div>`).join('')}
                        </div>
                    </div>
                    
                    <!-- 底部标识 -->
                    <div class="card-footer">
                        <span>卡厄斯工坊 · 记忆碎片计算器</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    // 计算总分
    calculateTotalScore(character) {
        if (!character.fragments) return 0;
        
        return character.fragments.reduce((sum, frag) => {
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
            
            if (!frag.mainAttr || !frag.mainValue) return sum;
            
            const mainVal = parseFloat(frag.mainValue);
            const mainMax = mainMaxMap[frag.mainAttr];
            if (!mainMax) return sum;
            
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
            
            return sum + Math.round(mainScore + subScore);
        }, 0);
    },
    
    // 获取评级
    getRating(graduationRate) {
        if (graduationRate >= 90) return 'S';
        if (graduationRate >= 80) return 'A';
        if (graduationRate >= 70) return 'B';
        if (graduationRate >= 60) return 'C';
        return 'D';
    },
    
    // 获取角色数据
    getCharacterData(charId) {
        const charData = CHARACTERS_DATA?.characters?.find(c => c.id === charId);
        return charData || {};
    },
    
    // 显示分享弹窗
    showShareModal(character) {
        const cardHtml = this.generateCard(character);
        
        const modal = `
            <div id="shareModal" class="modal share-modal">
                <div class="modal-content share-modal-content">
                    <div class="modal-header">
                        <h2>分享评分卡片</h2>
                        <span class="close-btn" onclick="ShareCard.hideShareModal()">×</span>
                    </div>
                    <div class="share-preview">
                        ${cardHtml}
                    </div>
                    <div class="share-actions">
                        <button class="btn btn-primary" onclick="ShareCard.exportImage()">
                            📷 导出图片
                        </button>
                        <button class="btn" onclick="ShareCard.hideShareModal()">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
        document.getElementById('shareModal').style.display = 'flex';
    },
    
    // 隐藏分享弹窗
    hideShareModal() {
        const modal = document.getElementById('shareModal');
        if (modal) {
            modal.remove();
        }
    },
    
    // 导出图片
    async exportImage() {
        const card = document.getElementById('shareCard');
        if (!card) return;
        
        // 确保html2canvas已加载
        if (!window.html2canvas) {
            await this.loadHtml2Canvas();
        }
        
        try {
            const canvas = await html2canvas(card, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
                logging: false
            });
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = `记忆碎片评分_${card.querySelector('.char-name').textContent}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('导出图片失败:', error);
            alert('导出图片失败，请重试');
        }
    },
    
    // 动态加载html2canvas
    loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
};

// 导出到全局
window.ShareCard = ShareCard;