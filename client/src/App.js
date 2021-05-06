import React from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

class App extends React.Component {

  state = {
    tasks: [],
    taskName: '',
    editedTask: {id: '', name: ''},
  }

  componentDidMount() {
    this.socket = io.connect('http://localhost:8000', { transports: ["websocket", 'polling-xhr'] });
    this.socket.on('addTask', task => this.addTask(task));
    this.socket.on('removeTask', id => this.removeTask(id));
    this.socket.on('updateData', data => this.updateTasks(data));
    this.socket.on('updateTask', task => this.updateTask(task));
  }

  updateTasks = newTasks => {
    this.setState({tasks: newTasks});
  }

  removeTask = (id, own = false) => {
    this.setState({
      tasks: this.state.tasks.filter(task => task.id !== id),
    });
    if(own) {
      this.socket.emit('removeTask', id);
    }
  }

  addTask = task => {
    this.setState({
      tasks: [...this.state.tasks, task],
    });
  }

  editTask = newName => {
    this.setState({
      ...this.state,
      editedTask: {
        ...this.state.editedTask,
        name: newName,
      }
    });
  }

  saveTask = () => {
    this.updateTask(this.state.editedTask);
    this.socket.emit('updateTask', this.state.editedTask);
    this.setState({editedTask: {id: '', name: ''}});
  }

  updateTask = newTask => {
    this.setState({
      tasks: this.state.tasks.map(task => task.id === newTask.id ? newTask : task)
    });
  }

  submitForm = event => {
    event.preventDefault();
    if (this.state.taskName) { 
      const id = uuidv4();
      const newTask = {id, name: this.state.taskName};
      this.addTask(newTask);
      this.socket.emit('addTask', newTask);
      this.setState({taskName: ''});
    }
  }

  render() {
    return (
      <div className="App">

        <header>
          <h1>ToDoList.app</h1>
        </header>

        <section className="tasks-section" id="tasks-section">
          <h2>Tasks</h2>

          <ul className="tasks-section__list" id="tasks-list">
            {this.state.tasks.map(({id, name}) => (
              <li key={id} className="task">
                <input 
                  type="text" 
                  className={'task__input' + (id === this.state.editedTask.id ? ' task__input--active' : '')}
                  autoComplete="off"  
                  value={id === this.state.editedTask.id ? this.state.editedTask.name : name}
                  readOnly={id !== this.state.editedTask.id}
                  onChange={event => this.editTask(event.target.value)}
                />
                <div>
                  { id === this.state.editedTask.id 
                    ? <button onClick={this.saveTask} className="btn btn--blue">Save</button> 
                    : <button onClick={() => this.setState({ editedTask: {id, name}})} className="btn btn--blue">Edit</button>
                  }
                  <button onClick={() => this.removeTask(id, true)} className="btn btn--red">Remove</button>
                </div>
              </li>
            ))}
          </ul>

          <form id="add-task-form" onSubmit={event => this.submitForm(event)}>
            <input 
              className="text-input" 
              autoComplete="off" 
              type="text" 
              placeholder="Type your description" 
              id="task-name"
              onChange={event => this.setState({ taskName: event.target.value })}
              value={this.state.taskName}
            />
            <button className="btn" type="submit">Add</button>
          </form>

        </section>
      </div>
    );
  };

};

export default App;
