

// const { library } = require("webpack");

const locStorage = (() => {
// check if local storage available

    let localStor = storageAvailable('localStorage');

    function storageAvailable(type) {
        var storage;
        try {
            storage = window[type];
            var x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                (storage && storage.length !== 0);
        }
    }

    function copyToLocal(projectList){
        if (localStor) {
            localStorage.setItem("todo", JSON.stringify(projectList));
        }
    }

    // returns local storage if available, if not returns empty array
    function getLocal(){
        if (localStor && JSON.parse(localStorage.getItem("todo")) != '') {
            let local = JSON.parse(localStorage.getItem("todo"));
            return local; 

        }
        else {
            return null;
        }
    }

    function resetLocal() {
        if (localStor) {
            localStorage.setItem('todo', JSON.stringify([]));
        }
    }

    return {
        copyToLocal,
        getLocal,
        resetLocal
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
        return [title, description, due, priority, status];
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
};

const Project = (title, description = '') => {
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

    const exportData = () => {
        let exporter = [title, []];
        for (let i = 0; i < tasks.length; i++) {
            exporter[1].push(tasks[i].getTask());
        }
        return exporter;
    }

    return {
        getTitle,
        setTitle,
        getDescription,
        setDescription,
        addTask,
        deleteTask,
        getTasks,
        exportData
    }
};

const projects = (() => {

    // add a new project
    const addProject = (project) => {
        projectList.push(project);
        locStorage.copyToLocal(exportProjects());
    }

    const createBlank = () => {
        let blank = Project('General');
        return [blank];
    }

    const deleteProject = (num) => {
        projectList.splice(num, 1);
        locStorage.copyToLocal(exportProjects());
    }

    const getProject = (index) =>  projectList[index];

    const getProjects = () => projectList;

    const updateProject = (index, project) => {
        projectList.splice(index, 1, project);
        locStorage.copyToLocal(exportProjects());
    }

    const exportProjects = () => {
        let exporter = [];
        for (let i = 0; i < projectList.length; i++) {
            exporter.push(projectList[i].exportData());
        };
        return exporter;
    }

    const importProjects = (projectArr) => {
        let arrFromImport = [];
        // cycle through each project
        for (let i = 0; i < projectArr.length; i++) {
            let newProject = Project(projectArr[i][0]);

            // get array containing task(s)
            let newTaskList = projectArr[i][1];

            // CHANGE TASKS FROM ARRAY TO OBJECTS W/ KEYS
            // create new tasks from each task, add them to project
            for (let j = 0; j < newTaskList.length; j++) {
                let newTitle = newTaskList[j][0];
                let newDescription = newTaskList[j][1];
                let newDue = newTaskList[j][2];
                let newPriority = newTaskList[j][3];
                let newStatus = newTaskList[j][4];

                let newTask = Task(newTitle, newDescription, newDue, newPriority, newStatus);
                newProject.addTask(newTask)
            }
            //push populated project into new project list
            arrFromImport.push(newProject);
            
        }
        return arrFromImport;
    }

    const numProjects = () => {
        return projectList.length;
    }

    let projectImport = locStorage.getLocal();
    let projectList;

    // create default list if no localstor, otherwise use local
    if (projectImport == null) {
        projectList = createBlank();
    }
    else {
        projectList = importProjects(projectImport);
    }

    return {
        addProject,
        deleteProject,
        getProjects,
        getProject,
        updateProject,
        exportProjects,
        importProjects,
        numProjects
    }

})();


// dummy tasks/projects for layout
// const t1 = Task('Task 1', 'Description for task 1', '2-5-2020', 2, 'open');
// const t2 = Task('Task 2', 'Second Description', '2-5-2020', 1, 'closed');
// const t3 = Task('Task 3', 'Third Description of task', '2-5-2020', 4, 'open');

// const p1 = Project('General 1', 'First project with tasks');
// const p2 = Project('Second Project', 'Description here');

// p1.addTask(t1);
// p1.addTask(t2);
// p1.addTask(t3);

// p2.addTask(t3);
// p2.addTask(t2);
// p2.addTask(t1);

// projects.addProject(p2);
// projects.addProject(p1);

//controller  for DOM elements
const renderPage = (() => {
    const content = document.querySelector('#content');
    let currentProjIndex = 0;
    let project = projects.getProject(currentProjIndex);
    let projectList = projects.getProjects();    
    
    const renderContent = (index) => {
        //clear page
        // const content = document.getElementById('content');
        content.innerHTML = '';

        // update current project index #
        currentProjIndex = index;

        //update current project
        project = projects.getProject(index);

        //render title
        const catHead = document.createElement('div');
        catHead.id = 'categoryHead';

        const catTitle = document.createElement('div');
        catTitle.id = 'categoryTitle';
        catTitle.textContent = project.getTitle();

        //project functions
        const catFunctions = document.createElement('div');
        catFunctions.id = 'categoryFunctions';

        // add task button
        const addTaskButton = document.createElement('input');
        addTaskButton.type = 'button';
        addTaskButton.setAttribute('onclick', 'renderPage.toggleTaskForm()');
        addTaskButton.value = "+ add task";
        addTaskButton.id = "addTaskButton";
        catFunctions.appendChild(addTaskButton);

        //delete project button
        const deleteProjectButton = document.createElement('input');
        deleteProjectButton.type = 'button';
        deleteProjectButton.setAttribute('onclick', `renderPage.dispatchDelProject(${currentProjIndex})`);
        deleteProjectButton.value = "- delete project";
        deleteProjectButton.id = "addTaskButton";
        catFunctions.appendChild(deleteProjectButton);

        catHead.appendChild(catTitle);
        catHead.appendChild(catFunctions);
        
        content.appendChild(catHead);

        //render tasks
        let taskList = project.getTasks();
        for (let i = 0; i < taskList.length; i++) {
            renderTask(taskList[i], i);
        }

        //update add task form
        const addTaskForm = document.getElementById('addTaskForm');
        addTaskForm.setAttribute('data-index', index);

        //update data-index for content page, to track for other functions
        content.setAttribute('data-index', index);
    };

    const renderTask = (task, index) => {
        let taskContainer = document.createElement('div');
        taskContainer.classList.add('taskContainer');
        

        let taskHead = document.createElement('div');
        taskHead.classList.add('taskHead');

        let taskTitle = document.createElement('div');
        taskTitle.classList.add('taskTitle');
        taskTitle.textContent = task.getTitle();

        // event listener to expand/contract task details (after task functions)
        taskTitle.addEventListener('click', () => toggleTaskBody(index));

        let dueDate = document.createElement('div');
        dueDate.classList.add('dueDate');
        dueDate.textContent = task.getDue();
        

        let taskFunctions = document.createElement('div');
        taskFunctions.classList.add('taskFunctions');

        const delTaskButton = document.createElement('input');
        delTaskButton.type = 'button';
        delTaskButton.setAttribute('onclick', `renderPage.dispatchDelTask(${index})`);
        delTaskButton.value = "- delete";
        delTaskButton.classList.add('delTaskButton');

        taskFunctions.appendChild(delTaskButton);

        let taskBody = document.createElement('div');
        taskBody.classList.add('taskBody');
        taskBody.id = `taskbody-${index}`;

        let taskDescription = document.createElement('div');
        taskDescription.classList.add('taskDescription');
        taskDescription.textContent = task.getDescription();

        taskHead.appendChild(taskTitle);
        taskHead.appendChild(dueDate);
        taskHead.appendChild(taskFunctions);

        taskBody.appendChild(taskDescription);

        taskContainer.appendChild(taskHead);
        taskContainer.appendChild(taskBody);

        // add task to content section
        content.appendChild(taskContainer);

    };

        //generate menu links
    const renderMenu = () => { 
        const projectMenu = document.getElementById('projectMenu');
        projectMenu.innerHTML = '';

        let projectHead = document.createElement('div');
        projectHead.id = 'projectHead';

        
        for (let i = 0; i < projectList.length; i++) {
            let projectLink = document.createElement('a');
            projectLink.classList.add('projectLink');
            projectLink.href = "#";
            projectLink.addEventListener('click', () => renderContent(i));
            projectLink.textContent = projectList[i].getTitle();
            projectLink.innerHTML = projectLink.innerHTML + "<br>"
            projectMenu.appendChild(projectLink);
        };
    };

    const toggleTaskForm = () => {
        const taskForm = document.querySelector('.taskWhiteOut');
        taskForm.classList.toggle('showTaskForm');

    };

    const toggleProjectForm = () => {
        const projectForm = document.querySelector('.projectWhiteOut');
        projectForm.classList.toggle('showProjectForm');
    };


    const toggleTaskBody = (index) => {
        let currentTaskBody = document.getElementById(`taskbody-${index}`);
        currentTaskBody.classList.toggle('showTaskBody');
    }

    const resetTaskForm = () => {
        document.getElementById('newTaskTitle').value = '';
        document.getElementById('newTaskDescription').value = '';
        document.getElementById('newTaskDue').value = '';
        document.getElementById('newTaskPriority').value = '1';
    };

    const dispatchAddTask = () => {
        let newTitle = document.getElementById('newTaskTitle').value;
        let newDescription = document.getElementById('newTaskDescription').value;
        let newDue = document.getElementById('newTaskDue').value;
        let newPriority = document.getElementById('newTaskPriority').value;
 
        let newTask = Task(newTitle,newDescription,newDue,newPriority);

        project.addTask(newTask);
        projects.updateProject(currentProjIndex, project);

        // rerender page
        renderPage.toggleTaskForm();
        resetTaskForm();
        renderPage.renderContent(currentProjIndex);

    };

    const dispatchDelTask = (id) => {
        project.deleteTask(id);
        projects.updateProject(currentProjIndex, project);
        renderPage.renderContent(currentProjIndex);
    };
    
    const dispatchDelProject = (id) => {
        if (confirm('Are you sure you want to delete this project?')) {
            projects.deleteProject(id);
            currentProjIndex = 0;
            renderPage.renderMenu();
            renderPage.renderContent(currentProjIndex);
        }
    };

    const dispatchAddProject = () => {
        let newTitle = document.getElementById('newProjectTitle').value;
        let newDescription = document.getElementById('newProjectDescription').value;

        let newProject = Project(newTitle, newDescription);

        // add project
        projects.addProject(newProject);

        //update menu
        renderPage.renderMenu();

        // toggle projectform
        renderPage.toggleProjectForm();

        // set current page to new project
       renderContent(projects.numProjects() - 1);
    }

    return {
        renderContent,
        renderMenu,
        toggleTaskForm,
        toggleProjectForm,
        dispatchAddTask,
        dispatchDelTask,
        dispatchDelProject,
        dispatchAddProject
    }

})();
// locStorage.resetLocal();

renderPage.renderContent(0);
renderPage.renderMenu();



