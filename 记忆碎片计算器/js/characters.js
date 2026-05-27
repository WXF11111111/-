let allCharacters = CHARACTERS_DATA.characters;
let myCharacters = [];

/* =========================
   初始化
========================= */
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav('characters');

    loadCharacters();
    renderCharacterSelect();
    renderMyCharacters();
});

/* =========================
   数据加载（统一入口）
========================= */
function loadCharacters() {
    myCharacters = Storage.get('myCharacters') || [];
}

/* =========================
   保存数据（统一入口）
========================= */
function saveCharacters() {
    Storage.set('myCharacters', myCharacters);
}

/* =========================
   渲染选择器
========================= */
function renderCharacterSelect() {
    const select = document.getElementById('characterSelect');
    select.innerHTML = '';

    allCharacters.forEach(char => {
        const opt = document.createElement('option');
        opt.value = char.id;
        opt.textContent = char.name;
        select.appendChild(opt);
    });
}

/* =========================
   渲染角色列表
========================= */
function renderMyCharacters() {
    const ctn = document.getElementById('myCharacters');

    if (!myCharacters.length) {
        ctn.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:30px 0;">
                暂无角色，点击右上角新建
            </div>
        `;
        return;
    }

    ctn.innerHTML = myCharacters
        .map((char, idx) => createCharacterCard(char, idx))
        .join('');
}

/* =========================
   单个角色卡片
========================= */
function createCharacterCard(char, idx) {
    const base = allCharacters.find(x => x.id === char.id);

    return `
        <div class="character-card" style="position:relative;">
            
            <div onclick="openCharacterDetail('${char.id}','${char.self}')">
                <img 
                    src="${base?.image || ''}" 
                    style="width:100%;aspect-ratio:1/1;object-fit:cover;"
                >

                <div class="name">${char.name}</div>
                <div class="chain">
                    自我意识 ${char.self} · Lv.${char.level}
                </div>
            </div>

            <div 
                onclick="deleteCharacter(${idx})"
                style="
                    position:absolute;
                    top:6px;
                    right:6px;
                    background:#e63946;
                    color:white;
                    font-size:12px;
                    padding:2px 6px;
                    cursor:pointer;
                "
            >
                ×
            </div>

        </div>
    `;
}

/* =========================
   创建角色
========================= */
function createCharacter() {
    const id = document.getElementById('characterSelect').value;
    const self = document.getElementById('selfLevel').value;
    const level = document.getElementById('charLevel').value;

    const base = allCharacters.find(x => x.id === id);

    if (myCharacters.some(x => x.id === id && x.self === self)) {
        alert('该角色已存在');
        return;
    }

    const newChar = {
        id,
        name: base.name,
        self,
        level,
        fragments: []
    };

    myCharacters.push(newChar);
    saveCharacters();
    renderMyCharacters();

    hideModal('createCharacterModal');
}

/* =========================
   删除角色
========================= */
function deleteCharacter(index) {
    if (!confirm('确定要删除该角色吗？')) return;

    myCharacters.splice(index, 1);
    saveCharacters();
    renderMyCharacters();
}

/* =========================
   跳转详情
========================= */
function openCharacterDetail(id, self) {
    navigateTo('character-detail.html', { id, self });
}