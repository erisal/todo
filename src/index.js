// alert('connected');
// console.log('whut');



const projects = (() => {
    let projectList = [];

    const addProject = (project) => projectList.unshift(project);

    const deleteProject = (num) => projectList.splice(num, 1);

    const getProjects = () => projectList;


    return {
        addProject,
        deleteProject,
        getProjects
    }

})();

const Task = (title, description = '', due = '', priority = 1, status = 'open') => {
    const notes = [];

    const getTitle = () => title;
    const setTitle = (newTitle) => title = newTitle;

    const getDescription = () => description;
    const setDescription = (newDescription) => description = newDescription;

    const getDue = () => due;
    const setDue = (newDue) => due = newDue;

    const getPriority = () => priority;
    const setPriority = (newPriority) => priority = newPriority;

    const getStatus = () => status;
    const toggleStatus = () => {
        if (status === 'open') status = 'closed';
        if (status === 'closed') status = 'open';
    };

    // for debugging, not used?
    const getTask = () => {
        return {title, description, due, priority, status};
    };

    const addNote = (note) => {
        notes.unshift(note);
    };
    const deleteNote = (num) => {
        notes.splice(num, 1);
    }

    return {
        getTitle,
        setTitle,
        getDescription,
        setDescription,
        getDue,
        setDue,
        getPriority,
        setPriority,
        getStatus,
        toggleStatus,
        getTask,
        addNote,
        deleteNote
    }
}

const Project = (title, description) => {
    const tasks = [];

    const getTitle = () => title;
    const setTitle = (newTitle) => title = newTitle;
    const getDescription = () => description;
    const setDescription = (newDescription) => description = newDescription;

    const addTask = (task) => {
        tasks.push(task);
    };

    const deleteTask = (num) => tasks.splice(num, 1);

    const getTasks = () => tasks;

    return {
        getTitle,
        setTitle,
        getDescription,
        setDescription,
        addTask,
        deleteTask,
        getTasks
    }
};

const renderPage = (() => {
    const content = document.querySelector('#content');

    const renderTasks = (project) => {
        let taskList = project.getTasks();

        taskList.forEach(task => {
            renderTask(task);
        });
    }

    const renderTask = (task) => {
        let taskContainer = document.createElement('div');
        taskContainer.classList.add('taskContainer');

        let taskHead = document.createElement('div');
        taskHead.classList.add('taskHead');

        let taskTitle = document.createElement('div');
        taskTitle.classList.add('taskTitle');

        let taskTitleText = document.createElement('h2');
        taskTitleText.textContent = task.getTitle();

        let dueDate = document.createElement('div');
        dueDate.classList.add('dueDate');
        let dueDateText = document.createElement('h3');
        dueDateText.textContent = task.getDue();

        let taskFunctions = document.createElement('div');
        taskFunctions.classList.add('taskFunctions');

        let taskBody = document.createElement('div');
        taskBody.classList.add('taskBody');

        let taskDescription = document.createElement('div');
        taskDescription.classList.add('taskDescription');

        let taskDescriptionText = document.createElement('h4');
        taskDescriptionText.textContent = task.getDescription();

        taskTitle.appendChild(taskTitleText);
        dueDate.appendChild(dueDateText);

        taskHead.appendChild(taskTitle);
        taskHead.appendChild(dueDate);
        taskHead.appendChild(taskFunctions);

        taskDescription.appendChild(taskDescriptionText);
        taskBody.appendChild(taskDescription);

        taskContainer.appendChild(taskHead);
        taskContainer.appendChild(taskBody);

        // add task to content section
        content.appendChild(taskContainer);

    }

//     <div class="taskContainer">
//     <div class="taskHead">
//         <div class="taskTitle">
//             <h2>Task Title</h2>
//         </div>
//         <div class="dueDate">
//             <h3>5 days</h3>
//         </div>
//         <div class="taskFunctions">
//             <a>✓ . </a><a>X</a>
//         </div>
//      </div>
//      <div class="taskBody">
//         <div class="taskDescription">
//             <h4>Description of a task goes here</h4>
//         </div>
//      </div>
// </div>

    return {
        renderTasks
    }

})();


// dummy tasks/projects for layout
const t1 = Task('Task 1', 'Description for task 1', '2-5-2020', 2, 'open');
const t2 = Task('Task 2', 'Second Description', '2-5-2020', 1, 'closed');
const t3 = Task('Task 3', 'Third Description of task', '2-5-2020', 4, 'open');

const p1 = Project('General', 'First project with tasks');
const p2 = Project('Second Project', 'Description here');

p1.addTask(t1);
p1.addTask(t2);
p1.addTask(t3);

p2.addTask(t3);
p2.addTask(t2);
p2.addTask(t1);

console.log(p1.getTasks());
console.table(p1.getTasks()[0].getTask());

renderPage.renderTasks(p1);
