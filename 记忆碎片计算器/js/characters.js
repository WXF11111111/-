// 缓存DOM元素引用
let _domCache = {};
const getDOM = (id) => {
    if (!_domCache[id]) {
        _domCache[id] = document.getElementById(id);
    }
    return _domCache[id];
};

// 数据缓存
let allCharacters = CHARACTERS_DATA.characters;
let myCharacters = Storage.get('myCharacters');

// 优化后的渲染函数
function renderCharacterSelect() {
    const select = getDOM('characterSelect');
    if (!select) return;
    
    // 使用DocumentFragment减少DOM操作
    const fragment = document.createDocumentFragment();
    
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '请选择角色';
    fragment.appendChild(defaultOpt);
    
    allCharacters.forEach(char => {
        const opt = document.createElement('option');
        opt.value = char.id;
        opt.textContent = char.name;
        fragment.appendChild(opt);
    });
    
    select.innerHTML = '';
    select.appendChild(fragment);
}

// 模板缓存
const characterCardTemplate = (char, base, idx) => `
<div class="character-card" data-idx="${idx}">
    <div class="char-content" data-id="${char.id}" data-self="${char.self}">
        <img data-src="${base?.image || ''}" class="lazy-image" style="width:100%;aspect-ratio:1/1;object-fit:cover;" alt="${char.name}">
        <div class="name">${char.name}</div>
        <div class="chain">自我意识 ${char.self} · Lv.${char.level}</div>
    </div>
    <button class="delete-btn" data-idx="${idx}">×</button>
</div>`;

function renderMyCharacters() {
    const ctn = getDOM('myCharacters');
    if (!ctn) return;
    
    if (myCharacters.length === 0) {
        ctn.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 0;color:var(--text-muted);">暂无角色，点击右上角新建</div>`;
        return;
    }

    // 使用数组join代替多次innerHTML拼接
    const html = myCharacters.map((char, idx) => {
        const base = allCharacters.find(x => x.id === char.id);
        return characterCardTemplate(char, base, idx);
    }).join('');
    
    ctn.innerHTML = html;
    
    // 绑定事件（使用事件委托）
    ctn.removeEventListener('click', handleCharacterClick);
    ctn.addEventListener('click', handleCharacterClick);
    
    // 触发懒加载
    if (window.lazyLoadImages) {
        window.lazyLoadImages();
    }
}

// 事件委托处理
function handleCharacterClick(e) {
    const target = e.target;
    const card = target.closest('.character-card');
    
    if (!card) return;
    
    if (target.classList.contains('delete-btn')) {
        const idx = parseInt(card.dataset.idx);
        deleteCharacter(idx);
    } else {
        const content = card.querySelector('.char-content');
        if (content) {
            navigateTo('character-detail.html', {
                id: content.dataset.id,
                self: content.dataset.self
            });
        }
    }
}

function createCharacter() {
    const id = getDOM('characterSelect').value;
    const self = getDOM('selfLevel').value;
    const level = getDOM('charLevel').value;
    const base = allCharacters.find(x => x.id === id);

    if (!id || !self) {
        alert('请选择角色和自我意识等级');
        return;
    }

    // 使用Set优化查找
    const exists = myCharacters.some(x => x.id === id && x.self === self);
    if (exists) {
        alert('该角色已存在');
        return;
    }

    myCharacters.push({ id, name: base.name, self, level, fragments: [] });
    Storage.set('myCharacters', myCharacters);
    renderMyCharacters();
    hideModal('createCharacterModal');
}

function deleteCharacter(index) {
    if (!confirm('确定要删除该角色吗？')) return;
    
    // 使用splice会修改原数组，直接创建新数组更安全
    myCharacters = myCharacters.filter((_, idx) => idx !== index);
    Storage.set('myCharacters', myCharacters);
    renderMyCharacters();
}

// DOMContentLoaded时执行
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav('characters');
    renderCharacterSelect();
    renderMyCharacters();
});