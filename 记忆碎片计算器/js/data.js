// 角色配置数据
// type: "dps"(主C/攻击输出), "def"(防御/反击), "support"(奶妈/护盾/辅助)
const CHARACTERS_DATA = {
    "characters": [
        { "id": "heidemali", "name": "海德玛丽", "type": "dps", "image": "assets/海德玛丽.png" },
        { "id": "weianna", "name": "维安娜", "type": "dps", "image": "assets/维安娜.png" },
        { "id": "lita", "name": "丽塔", "type": "dps", "image": "assets/丽塔.png" },
        { "id": "difeila", "name": "蒂菲拉", "type": "dps", "image": "assets/蒂菲拉.png" },
        { "id": "naiyin", "name": "奈音", "type": "dps", "image": "assets/奈音.png" },
        { "id": "najia", "name": "娜嘉", "type": "dps", "image": "assets/娜嘉.png" },
        { "id": "saileinier", "name": "赛雷妮尔", "type": "dps", "image": "assets/赛雷妮尔.png" },
        { "id": "qianhe", "name": "千鹤", "type": "dps", "image": "assets/千鹤.png" },
        { "id": "youji", "name": "友纪", "type": "dps", "image": "assets/友纪.png" },
        { "id": "xiaochun", "name": "小春", "type": "dps", "image": "assets/小春.png" },
        { "id": "lin", "name": "琳", "type": "dps", "image": "assets/琳.png" },
        { "id": "luke", "name": "路克", "type": "dps", "image": "assets/路克.png" },
        { "id": "kalipei", "name": "卡莉佩", "type": "support", "image": "assets/卡莉佩.png" },
        { "id": "maigena", "name": "麦格纳", "type": "dps", "image": "assets/麦格纳.png" },
        { "id": "aoerlaiya", "name": "奥尔莱亚", "type": "def", "image": "assets/奥尔莱亚.png" },
        { "id": "meiling", "name": "梅铃", "type": "dps", "image": "assets/梅铃.png" },
        { "id": "weiruonika", "name": "维若妮卡", "type": "dps", "image": "assets/维若妮卡.png" },
        { "id": "leiona", "name": "蕾欧娜", "type": "def", "image": "assets/蕾欧娜.png" },
        { "id": "yuguo", "name": "雨果", "type": "def", "image": "assets/雨果.png" },
        { "id": "kailong", "name": "凯隆", "type": "dps", "image": "assets/凯隆.png" },
        { "id": "niya", "name": "妮雅", "type": "dps", "image": "assets/妮雅.png" },
        { "id": "xilinna", "name": "席琳娜", "type": "dps", "image": "assets/席琳娜.png" },
        { "id": "deleisha", "name": "德蕾莎", "type": "support", "image": "assets/德蕾莎.png" },
        { "id": "aimei", "name": "艾美", "type": "support", "image": "assets/艾美.png" },
        { "id": "lukasi", "name": "卢卡斯", "type": "dps", "image": "assets/卢卡斯.png" },
        { "id": "malibeier", "name": "玛丽贝尔", "type": "dps", "image": "assets/玛丽贝尔.png" },
        { "id": "mika", "name": "米卡", "type": "dps", "image": "assets/米卡.png" },
        { "id": "bailier", "name": "百丽儿", "type": "dps", "image": "assets/百丽儿.png" },
        { "id": "kaisixiusi", "name": "凯西乌斯", "type": "def", "image": "assets/凯西乌斯.png" },
        { "id": "ouwen", "name": "欧文", "type": "dps", "image": "assets/欧文.png" },
        { "id": "leiyi", "name": "蕾伊", "type": "dps", "image": "assets/蕾伊.png" }
    ]
};

// 完整的碎片规则（严格匹配你的表格）
const FRAGMENT_RULES = {
    "mainAttrs": {
        "impact": { 
            "name": "冲击/左一", 
            "attrs": ["攻击+"],
            "values": { "攻击+": [12, 14, 16, 18, 20, 22] }
        },
        "suppress": { 
            "name": "压抑/左二", 
            "attrs": ["防御+"],
            "values": { "防御+": [12, 14, 16, 18, 20, 22] }
        },
        "deny": { 
            "name": "否定/左三", 
            "attrs": ["HP+"],
            "values": { "HP+": [20, 23, 27, 30, 33, 37] }
        },
        "ideal": { 
            "name": "理想/右一", 
            "attrs": ["攻击%", "HP%", "暴击%", "暴伤%"],
            "values": {
                "攻击%": [7.50, 11.00, 14.50, 18.00, 21.50, 25.00],
                "HP%": [7.50, 11.00, 14.50, 18.00, 21.50, 25.00],
                "暴击%": [4.50, 9.00, 13.50, 18.00, 22.50, 27.00],
                "暴伤%": [6.80, 13.60, 20.40, 27.20, 34.00, 40.80]
            }
        },
        "desire": { 
            "name": "渴望/右二", 
            "attrs": ["攻击%", "HP%", "热情属性伤害%", "正义属性伤害%", "秩序属性伤害%", "虚无属性伤害%", "本能属性伤害%"],
            "values": {
                "攻击%": [7.50, 11.00, 14.50, 18.00, 21.50, 25.00],
                "HP%": [7.50, 11.00, 14.50, 18.00, 21.50, 25.00],
                "热情属性伤害%": [5.00, 7.20, 9.40, 11.60, 13.80, 16.00],
                "正义属性伤害%": [5.00, 7.20, 9.40, 11.60, 13.80, 16.00],
                "秩序属性伤害%": [5.00, 7.20, 9.40, 11.60, 13.80, 16.00],
                "虚无属性伤害%": [5.00, 7.20, 9.40, 11.60, 13.80, 16.00],
                "本能属性伤害%": [5.00, 7.20, 9.40, 11.60, 13.80, 16.00]
            }
        },
        "imagine": { 
            "name": "想像/右三", 
            "attrs": ["攻击%", "防御%", "HP%", "自我意识恢复"],
            "values": {
                "攻击%": [7.50, 11.00, 14.50, 18.00, 21.50, 25.00],
                "防御%": [7.50, 11.00, 14.50, 18.00, 21.50, 25.00],
                "HP%": [7.50, 11.00, 14.50, 18.00, 21.50, 25.00],
                "自我意识恢复": [10, 16, 22, 28, 34, 40]
            }
        }
    },
    "subAttrs": {
        "攻击+": { "min": 5, "max": 8 },
        "防御+": { "min": 3, "max": 5 },
        "HP+": { "min": 10, "max": 12 },
        "攻击%": { "min": 0.8, "max": 1.3 },
        "防御%": { "min": 0.8, "max": 1.3 },
        "HP%": { "min": 0.8, "max": 1.3 },
        "暴击%": { "min": 1.2, "max": 2.0 },
        "暴伤%": { "min": 2.4, "max": 4.0 },
        "自我意识恢复": { "min": 2, "max": 5 },
        "额外伤害%": { "min": 2.7, "max": 3.4 },
        "持续伤害%": { "min": 2.7, "max": 3.4 }
    }
};