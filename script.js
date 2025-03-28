document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const itemsLeft = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';
    
    // 初期表示
    renderTodos();
    updateItemsLeft();
    
    // イベントリスナーの設定
    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTodos();
        });
    });
    
    // TODO追加処理
    function addTodo() {
        const todoText = todoInput.value.trim();
        if (!todoText) return;
        
        const newTodo = {
            id: Date.now().toString(),
            text: todoText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        todos.push(newTodo);
        saveTodos();
        renderTodos();
        updateItemsLeft();
        
        todoInput.value = '';
        todoInput.focus();
    }
    
    // TODO表示処理
    function renderTodos() {
        todoList.innerHTML = '';
        
        const filteredTodos = filterTodos(todos, currentFilter);
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;
            
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <button class="delete-btn">×</button>
            `;
            
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => {
                toggleTodo(todo.id);
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
        itemsLeft.textContent = `${activeTodos.length} 個のタスクが残っています`;
    }
    
    // LocalStorageへの保存
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
});