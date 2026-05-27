let allCharacters = CHARACTERS_DATA.characters;
let myCharacters = Storage.get('myCharacters') || [];

document.addEventListener('DOMContentLoaded', () => {
    setActiveNav('characters');
    renderCharacterSelect();
    renderMyCharacters();
});

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

function renderMyCharacters() {
    const ctn = document.getElementById('myCharacters');

    if (!myCharacters.length) {
        ctn.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px 0;">暂无角色</div>`;
        return;
    }

    ctn.innerHTML = myCharacters.map((char, idx) => {
        const base = allCharacters.find(x => x.id === char.id);

        return `
        <div class="character-card" style="position:relative;">
            <div onclick="openCharacterDetail('${char.id}','${char.self}')">
                <img src="${base?.image || ''}" style="width:100%;aspect-ratio:1/1;object-fit:cover;">
                <div class="name">${char.name}</div>
                <div class="chain">自我意识 ${char.self} · Lv.${char.level}</div>
            </div>

            <div onclick="deleteCharacter(${idx})"
                 style="position:absolute;top:6px;right:6px;background:#e63946;color:white;padding:2px 6px;">
                ×
            </div>
        </div>`;
    }).join('');
}

function createCharacter() {
    const id = document.getElementById('characterSelect').value;
    const self = document.getElementById('selfLevel').value;
    const level = document.getElementById('charLevel').value;

    const base = allCharacters.find(x => x.id === id);

    if (myCharacters.some(x => x.id === id && x.self === self)) {
        alert('角色已存在');
        return;
    }

    myCharacters.push({
        id,
        name: base.name,
        self,
        level,
        fragments: []   // ✅ 修复这里
    });

    Storage.set('myCharacters', myCharacters);
    renderMyCharacters();
    hideModal('createCharacterModal');
}

function deleteCharacter(index) {
    if (!confirm('确定删除？')) return;

    myCharacters.splice(index, 1);
    Storage.set('myCharacters', myCharacters);
    renderMyCharacters();
}

function openCharacterDetail(id, self) {
    navigateTo('character-detail.html', { id, self });
}