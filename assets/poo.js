class DomHelper {
	static clearEventListeners(element) {
    	const clonedElement = element.cloneNode(true);
    	element.replaceWith(clonedElement);
    	return clonedElement;
  	}
	
	static moveElement(elementId, newDestinationSelector){
		const element = document.getElementById(elementId);
    	const destinationElement = document.querySelector(newDestinationSelector);
    	destinationElement.append(element);
		element.scrollIntoView({behavior: 'smooth'});
	}
}

class Component {
    constructor(hostElementId, insertBefore = false) {
        if (hostElementId) {
            this.hostElement = document.getElementById(hostElementId);
        } else {
            this.hostElement = document.body;
        }
        this.insertBefore = insertBefore;
    }

    detach() {
        if (this.element) {
            this.element.remove();
        }
    }

    attach() {
        this.hostElement.insertAdjacentElement(
            this.insertBefore ? 'afterbegin' : 'beforeend',
            this.element
        );
    }
}

class Tooltip extends Component {
    constructor(closeNotifierFunction, text, hostElementId) {
        super(hostElementId);
        this.closeNotifier = closeNotifierFunction;
        this.text = text;
        this.create();
    }

    closeTooltip = () => {
        this.detach();
        this.closeNotifier();
    };

    create() {
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'tooltip';
        tooltipElement.textContent = this.text;
		
		//console.log(this.hostElement.getBoundingClientRect());
		
		const hostElPosLeft = this.hostElement.offsetLeft;
		const hostElPosTop = this.hostElement.offsetTop;
		const hostElHeight = this.hostElement.clientHeight;
		const parentElementScrolling = this.hostElement.parentElement.scrollTop;
		
		const x = hostElPosLeft + 20;
		const y = hostElPosTop + hostElHeight - parentElementScrolling - 10;
		
		tooltipElement.style.position = 'absolute';
		tooltipElement.style.left = x + 'px';
		tooltipElement.style.top = y + 'px';
		
		tooltipElement.addEventListener('click', this.closeTooltip);
        this.element = tooltipElement;
    }
}

class ProjectItem {
	hasActiveTooltip = false;
	
	constructor(id, updateProjectListFunction, type){
		this.id = id;
		this.updateProjectListsHandler = updateProjectListFunction;
		
		this.connectInfoButton();
		this.connectSwitchButton(type);
		this.connectDrag();
	}
	
	showMoreInfoHandler() {
        if (this.hasActiveTooltip) {
            return;
        }
		
        const projectElement = document.getElementById(this.id);
        const tooltipText = projectElement.dataset.extraInfo;
        const tooltip = new Tooltip(() => {
            this.hasActiveTooltip = false;
        }, tooltipText, this.id);
        tooltip.attach();
        this.hasActiveTooltip = true;
    }
	
	connectDrag(){
		const item = document.getElementById(this.id);
        
        item.addEventListener('dragstart', event => {
			event.dataTransfer.setData('text/plain', this.id);
			event.dataTransfer.effectAllowed = 'move';
		});

        item.addEventListener('dragend', event => {
            console.log(event);
        });
	}
	
	connectInfoButton(){
		const projectItemEl = document.getElementById(this.id);
		let infoBtn = projectItemEl.querySelector('button:first-of-type');
		
		infoBtn.addEventListener('click', this.showMoreInfoHandler.bind(this));
	}
	
	connectSwitchButton(type){
		const projectItemEl = document.getElementById(this.id);
		let switchBtn = projectItemEl.querySelector('button:last-of-type');
		switchBtn = DomHelper.clearEventListeners(switchBtn);
		switchBtn.textContent = type === 'active' ? 'Finish' : 'Activate';
		switchBtn.addEventListener('click', this.updateProjectListsHandler.bind(null, this.id));
	}
	
	update(updateProjectListsFn, type){
    	this.updateProjectListsHandler = updateProjectListsFn;
    	this.connectSwitchButton(type);
  	}
}

class ProjectList {
	projects = [];
	
	constructor(type){
		this.type = type;
		
		const projectItems = document.querySelectorAll(`#${type}-projects li`);
		
		for(const item of projectItems){
			this.projects.push(new ProjectItem(item.id, this.switchProject.bind(this), this.type));
		}
		
		this.connectDroppable();
	}
	
	connectDroppable(){
		const list = document.querySelector(`#${this.type}-projects ul`);
		
		list.addEventListener('dragenter', event => {
			if(event.dataTransfer.types[0] === 'text/plain'){
				list.parentElement.classList.add('droppable');
				event.preventDefault();
			}
		});
		
		list.addEventListener('dragover', event => {
			if(event.dataTransfer.types[0] === 'text/plain'){
				event.preventDefault();
			}
		});
		
		list.addEventListener('dragleave', event => {
			if(event.relatedTarget.closest(`#${this.type}-projects ul`) !== list){
				list.parentElement.classList.remove('droppable');
			}
		});
		
		list.addEventListener('drop', event => {
			event.preventDefault();
			const projectId = event.dataTransfer.getData('text/plain');
			
			if(this.projects.find(p => p.id === projectId)){
				return;
			}
			
			document.getElementById(projectId).querySelector('button:last-of-type').click();
			list.parentElement.classList.remove('droppable');
		});
	}
	
	setSwitchHandler(switchHandlerFunction){
		this.switchHandler = switchHandlerFunction;
	}
	
	addProject(project){
		this.projects.push(project);
		DomHelper.moveElement(project.id, `#${this.type}-projects ul`);
    	project.update(this.switchProject.bind(this), this.type);
	}
	
	switchProject(projectId){
		this.switchHandler(this.projects.find(p => p.id === projectId));
		this.projects = this.projects.filter(p => p.id !== projectId);
	}
}
/*evento para animar el menu*/
 
function destino() {
  var url = document.navegador.secciones.options[document.navegador.secciones.selectedIndex].value

  if (url != " no") {
    window.location = url;
  }
}



class App { 
	static init(){
		const activeProjectList = new ProjectList('active');
		const finishedProjectList = new ProjectList('finished');
		
		activeProjectList.setSwitchHandler(finishedProjectList.addProject.bind(finishedProjectList));	
		finishedProjectList.setSwitchHandler(activeProjectList.addProject.bind(activeProjectList));
	}
} 
/*evento para icultar informacion*/
function muestraOculta(id) {
  var elemento = document.getElementById('contenidos_'+id);
  var enlace = document.getElementById('enlace_'+id);

  if(elemento.style.display == "" || elemento.style.display == "block") {
    elemento.style.display = "none";
    enlace.innerHTML = 'Mostrar contenidos';
  }
  else {
    elemento.style.display = "block";
    enlace.innerHTML = 'Ocultar contenidos';
  }
}

 


App.init();	