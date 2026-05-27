let currentCharacter = null;
let allCharacters = CHARACTERS_DATA.characters;

document.addEventListener('DOMContentLoaded', () => {
    const p = getUrlParams();

    const list = Storage.get('myCharacters') || [];

    currentCharacter = list.find(x => x.id === p.id && x.self === p.self);

    if (!currentCharacter) {
        alert("角色不存在");
        return;
    }

    if (!Array.isArray(currentCharacter.fragments)) {
        currentCharacter.fragments = [];
    }

    renderCharacterInfo();
    renderFragments();
});