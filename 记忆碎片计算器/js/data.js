/* =========================
   角色数据（增强语义）
========================= */
const CHARACTERS_DATA = {
    characters: [
        {
            id: "heidemali",
            name: "海德玛丽",
            type: "dps",
            tags: ["爆发", "主C"],
            image: "assets/海德玛丽.png"
        },
        {
            id: "kalipei",
            name: "卡莉佩",
            type: "support",
            tags: ["治疗", "辅助"],
            image: "assets/卡莉佩.png"
        },
        {
            id: "aoerlaiya",
            name: "奥尔莱亚",
            type: "def",
            tags: ["坦克", "反击"],
            image: "assets/奥尔莱亚.png"
        }
    ]
};

/* =========================
   碎片规则（升级为“评分模型”）
========================= */
const FRAGMENT_MODEL = {
    mainAttrs: {
        impact: {
            name: "冲击/左一",
            attrs: ["攻击+"],
            scale: 40,
            values: [12, 14, 16, 18, 20, 22]
        },
        suppress: {
            name: "压抑/左二",
            attrs: ["防御+"],
            scale: 40,
            values: [12, 14, 16, 18, 20, 22]
        },
        deny: {
            name: "否定/左三",
            attrs: ["HP+"],
            scale: 40,
            values: [20, 23, 27, 30, 33, 37]
        },
        ideal: {
            name: "理想/右一",
            attrs: ["攻击%", "暴击%", "暴伤%", "HP%"],
            scale: 40,
            values: {
                "攻击%": [7.5,11,14.5,18,21.5,25],
                "暴击%": [4.5,9,13.5,18,22.5,27],
                "暴伤%": [6.8,13.6,20.4,27.2,34,40.8],
                "HP%": [7.5,11,14.5,18,21.5,25]
            }
        }
    },

    /* =========================
       副词条：评分权重模型（重点升级）
    ========================= */
    subAttrs: {
        "攻击+": { range: [5,8], weight: { dps: 1.0, def: 0.6, support: 0.4 } },
        "防御+": { range: [3,5], weight: { dps: 0.3, def: 1.2, support: 0.8 } },

        "暴击%": { range: [1.2,2.0], weight: { dps: 1.3, def: 0.7, support: 0.5 } },
        "暴伤%": { range: [2.4,4.0], weight: { dps: 1.2, def: 0.6, support: 0.4 } },

        "HP%": { range: [0.8,1.3], weight: { dps: 0.5, def: 0.8, support: 1.1 } },

        "自我意识恢复": { range: [2,5], weight: { dps: 0.4, def: 0.9, support: 1.2 } },

        "额外伤害%": { range: [2.7,3.4], weight: { dps: 1.0, def: 0.7, support: 0.6 } }
    }
};