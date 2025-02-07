
let editingCard = null;

// Função para inicializar drag-and-drop
function enableDragAndDrop() {
    document.querySelectorAll('.kanban-card').forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', e => e.currentTarget.classList.add('dragging'));
        card.addEventListener('dragend', e => e.currentTarget.classList.remove('dragging'));
    });

    document.querySelectorAll('.kanban-cards').forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault();
            const draggingCard = document.querySelector('.dragging');
            const afterElement = getDragAfterElement(column, e.clientY);
            if (afterElement == null) {
                column.appendChild(draggingCard);
            } else {
                column.insertBefore(draggingCard, afterElement);
            }
        });
    });
}

// Função auxiliar para posicionar o card corretamente
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Ativar funcionalidade de excluir e editar cards
function enableCardActions() {
    document.querySelectorAll('.delete-card').forEach(icon => {
        icon.addEventListener('click', e => {
            const card = e.target.closest('.kanban-card');
            if (card) card.remove();
        });
    });

    document.querySelectorAll('.edit-card').forEach(icon => {
        icon.addEventListener('click', e => {
            const card = e.target.closest('.kanban-card');
            if (card) {
                editingCard = card; // Armazena o card que está sendo editado
                const currentTitle = card.querySelector('.card-title').textContent.trim();
                const currentPriority = card.querySelector('.badge span').textContent.toLowerCase().includes('alta') ? 'alta' :
                    card.querySelector('.badge span').textContent.toLowerCase().includes('media') ? 'media' : 'baixa';

                // Preenche os campos do modal com os valores atuais do card
                document.getElementById('editCardTitleInput').value = currentTitle;
                document.getElementById('editCardPriorityInput').value = currentPriority;

                const modalEditCard = new bootstrap.Modal(document.getElementById('modalEditCard'));
                modalEditCard.show();
            }
        });
    });
}

// Inicializar o Kanban
function initializeKanban() {
    enableDragAndDrop();
    enableCardActions();
}

// Adicionar ou atualizar um card
let selectedColumn = null;
document.querySelectorAll('.add-card').forEach(button => {
    button.addEventListener('click', function () {
        selectedColumn = button.closest('.kanban-column');
    });
});

document.getElementById('confirmAddCard').addEventListener('click', () => {
    const cardTitle = document.getElementById('cardTitleInput').value;
    const cardPriority = document.getElementById('cardPriorityInput').value;

    if (!cardTitle.trim()) {
        alert('O título do card é obrigatório!');
        return;
    }

    if (editingCard) {
        // Atualiza o card existente
        const badgeClass = cardPriority === 'alta' ? 'alta' : cardPriority === 'media' ? 'media' : 'baixa';

        editingCard.querySelector('.badge').className = `badge ${badgeClass}`;
        editingCard.querySelector('.badge span').textContent = `${cardPriority.charAt(0).toUpperCase() + cardPriority.slice(1)} prioridade`;
        editingCard.querySelector('.card-title').textContent = cardTitle;

        editingCard = null; // Reseta a variável após a edição
    } else if (selectedColumn) {
        // Cria um novo card
        const card = document.createElement('div');
        card.classList.add('kanban-card');
        card.setAttribute('draggable', 'true');
        const badgeClass = cardPriority === 'alta' ? 'alta' : cardPriority === 'media' ? 'media' : 'baixa';

        card.innerHTML = `
            <div class="badge ${badgeClass}">
                <span>${cardPriority.charAt(0).toUpperCase() + cardPriority.slice(1)} prioridade</span>
            </div>
            <p class="card-title">${cardTitle}</p>
            <div class="card-infos">
                <div class="card-icons">
                    <i class="fa-solid fa-pen edit-card"></i>
                    <i class="fa-solid fa-trash delete-card"></i>
                </div>
                <div class="user">
                    <img src="./src/images/perfil.jpg" alt="User">
                </div>
            </div>
        `;

        selectedColumn.querySelector('.kanban-cards').appendChild(card);
    }

    initializeKanban(); // Reaplica eventos nos cards
    document.getElementById('cardTitleInput').value = '';

    // Fecha o modal de forma segura
    const modalAddCard = bootstrap.Modal.getInstance(document.getElementById('modalAddCard'));
    modalAddCard.hide();
});

// Adicionar uma nova lista
document.getElementById('confirmAddList').addEventListener('click', () => {
    const listTitle = document.getElementById('listTitleInput').value;

    if (!listTitle.trim()) {
        alert('O título da lista é obrigatório!');
        return;
    }

    const newColumn = document.createElement('div');
    newColumn.classList.add('kanban-column');
    newColumn.setAttribute('data-id', Date.now());
    newColumn.innerHTML = `
        <div class="kanban-title">
            <h2>${listTitle}</h2>
            <button class="add-card" data-bs-toggle="modal" data-bs-target="#modalAddCard">
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
        <div class="kanban-cards"></div>
    `;

    document.querySelector('.kanban').insertBefore(newColumn, document.querySelector('.add-list'));
    initializeKanban();
    document.getElementById('listTitleInput').value = '';
    const modalAddList = bootstrap.Modal.getInstance(document.getElementById('modalAddList'));
    modalAddList.hide();
});

// Salvar as alterações no card editado
document.getElementById('saveEditCard').addEventListener('click', () => {
    const newTitle = document.getElementById('editCardTitleInput').value;
    const newPriority = document.getElementById('editCardPriorityInput').value;

    if (!newTitle.trim()) {
        alert('O título do card é obrigatório!');
        return;
    }

    // Atualiza o card
    const badgeClass = newPriority === 'alta' ? 'alta' : newPriority === 'media' ? 'media' : 'baixa';
    editingCard.querySelector('.badge').className = `badge ${badgeClass}`;
    editingCard.querySelector('.badge span').textContent = `${newPriority.charAt(0).toUpperCase() + newPriority.slice(1)} prioridade`;
    editingCard.querySelector('.card-title').textContent = newTitle;

    // Fecha o modal de edição
    const modalEditCard = bootstrap.Modal.getInstance(document.getElementById('modalEditCard'));
    modalEditCard.hide();

    editingCard = null; // Reseta a variável após salvar
});

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    initializeKanban();
});
