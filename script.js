document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const itemsLeft = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const priorityButtons = document.querySelectorAll('.task-input-wrapper .priority-btn');
    const modal = document.getElementById('task-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalTaskTitle = document.getElementById('modal-task-title');
    const modalPriorityButtons = document.querySelectorAll('.modal-body .priority-btn');
    const modalCreatedDate = document.getElementById('modal-created-date');
    const modalSaveBtn = document.getElementById('modal-save-btn');
    const modalDeleteBtn = document.getElementById('modal-delete-btn');
    
    // State
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';
    let currentPriority = 'low';
    let currentEditId = null;
    
    // ハンドラーの初期設定
    initApp();
    
    // 初期設定とイベントリスナー
    function initApp() {
        renderTodos();
        updateItemsLeft();
        
        // イベントリスナー
        addButton.addEventListener('click', addTodo);
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });
        clearCompletedBtn.addEventListener('click', clearCompleted);
        
        // フィルターボタン
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.getAttribute('data-filter');
                renderTodos();
            });
        });
        
        // 優先度ボタン
        priorityButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                priorityButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPriority = btn.getAttribute('data-priority');
            });
        });
        
        // モーダル
        closeModal.addEventListener('click', closeTaskModal);
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeTaskModal();
            }
        });
        
        modalSaveBtn.addEventListener('click', saveTaskChanges);
        modalDeleteBtn.addEventListener('click', deleteCurrentTask);
        
        // モーダル内の優先度ボタン
        modalPriorityButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modalPriorityButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    // TODO追加処理
    function addTodo() {
        const todoText = todoInput.value.trim();
        if (!todoText) return;
        
        const newTodo = {
            id: Date.now().toString(),
            text: todoText,
            completed: false,
            priority: currentPriority,
            createdAt: new Date().toISOString()
        };
        
        todos.push(newTodo);
        saveTodos();
        renderTodos();
        updateItemsLeft();
        
        todoInput.value = '';
        todoInput.focus();
        
        // 成功メッセージやアニメーションを追加することもできます
    }
    
    // TODO表示処理
    function renderTodos() {
        todoList.innerHTML = '';
        
        const filteredTodos = filterTodos(todos, currentFilter);
        
        if (filteredTodos.length === 0) {
            // 空の状態を表示
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>タスクがありません</p>
                    <p class="empty-state-subtitle">新しいタスクを追加してみましょう</p>
                </div>
            `;
            return;
        }
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;
            
            // 日付のフォーマット
            const createdDate = new Date(todo.createdAt);
            const formattedDate = formatDate(createdDate);
            
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="priority-indicator priority-${todo.priority}"></div>
                <div class="todo-content">
                    <span class="todo-text">${todo.text}</span>
                    <span class="todo-date">${formattedDate}</span>
                </div>
                <div class="todo-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => {
                toggleTodo(todo.id);
            });
            
            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => {
                openEditModal(todo);
            });
            
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                deleteTodo(todo.id);
            });
            
            todoList.appendChild(li);
        });
    }
    
    // フィルタリング処理
    function filterTodos(todos, filter) {
        switch (filter) {
            case 'active':
                return todos.filter(todo => !todo.completed);
            case 'completed':
                return todos.filter(todo => todo.completed);
            case 'all':
            default:
                return todos;
        }
    }
    
    // TODOの完了状態切り替え
    function toggleTodo(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        
        saveTodos();
        renderTodos();
        updateItemsLeft();
    }
    
    // TODO削除処理
    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateItemsLeft();
    }
    
    // 完了済みTODO削除処理
    function clearCompleted() {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateItemsLeft();
    }
    
    // 残りタスク数更新
    function updateItemsLeft() {
        const activeTodos = todos.filter(todo => !todo.completed);
        document.querySelector('#items-left .count').textContent = activeTodos.length;
    }
    
    // LocalStorageへの保存
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // モーダルを開く（編集モード）
    function openEditModal(todo) {
        currentEditId = todo.id;
        modalTaskTitle.value = todo.text;
        
        // 優先度ボタンの設定
        modalPriorityButtons.forEach(btn => {
            const priority = btn.getAttribute('data-priority');
            if (priority === todo.priority) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // 作成日の表示
        modalCreatedDate.textContent = formatDate(new Date(todo.createdAt));
        
        // モーダルを表示
        modal.style.display = 'block';
    }
    
    // モーダルを閉じる
    function closeTaskModal() {
        modal.style.display = 'none';
        currentEditId = null;
    }
    
    // タスクの変更を保存
    function saveTaskChanges() {
        if (!currentEditId) return;
        
        const newText = modalTaskTitle.value.trim();
        if (!newText) return;
        
        // 選択中の優先度を取得
        let selectedPriority = 'low';
        modalPriorityButtons.forEach(btn => {
            if (btn.classList.contains('active')) {
                selectedPriority = btn.getAttribute('data-priority');
            }
        });
        
        // タスク更新
        todos = todos.map(todo => {
            if (todo.id === currentEditId) {
                return { 
                    ...todo, 
                    text: newText,
                    priority: selectedPriority,
                    updatedAt: new Date().toISOString()
                };
            }
            return todo;
        });
        
        saveTodos();
        renderTodos();
        closeTaskModal();
    }
    
    // 現在編集中のタスクを削除
    function deleteCurrentTask() {
        if (currentEditId) {
            deleteTodo(currentEditId);
            closeTaskModal();
        }
    }
    
    // 日付のフォーマット
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
});