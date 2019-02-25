import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [],
            taskName: ''
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }

    componentDidMount() {
        axios.get('http://localhost:3000/api/tasks/')
            .then(response => {
                this.setState({ tasks: response.data })
            })
            .catch(err => console.error(err))
    }

    handleSubmit(e) {
        e.preventDefault()
        if (this.state.taskName === '' || this.state.taskName === null) {
            return
        } else {
            axios.put('http://localhost:3000/api/tasks/', { name: this.state.taskName })
                .then(response => {
                    this.setState(state => ({
                        tasks: state.tasks.concat(response.data),
                        taskName: ''
                    }));
                })
                .catch(err => console.error(err))
        }
    }

    handleChange(e) {
        this.setState({ taskName: e.target.value })
    }

    handleDelete(id) {
        axios.delete(`http://localhost:3000/api/tasks/${id}`)
            .then(response => {
                if (response.data === 'OK') {
                    this.setState(state => ({
                        tasks: state.tasks.filter(task => task.task_id !== id)
                    }))
                }
            })
            .catch(e => console.error(e))
    }

    handleToggle(task) {
        axios.post(`http://localhost:3000/api/tasks/${task.task_id}`, { isDone: !task.is_done })
            .then(response => {
                const updatedTask = response.data
                this.setState(state => ({
                    tasks: state.tasks.map(taskk => {
                        if (taskk.task_id === updatedTask.task_id) {
                            return updatedTask;
                        }
                        return taskk;
                    })
                }))
            })
            .catch(e => console.error(e))
    }

    render() {
        return (
            <div>
                <h1>To-Do</h1>
                <form onSubmit={this.handleSubmit}>
                    <input onChange={this.handleChange} type="text" placeholder="Add a new task" value={this.state.taskName} />
                    <button type="submit">Add</button>
                </form>
                <ul>
                    {
                        this.state.tasks.map(task => (
                            <li key={task.task_id}>
                                <input type="checkbox" checked={task.is_done} onChange={() => this.handleToggle(task)} />
                                <p className={task.is_done ? 'task_done': ''}>{task.task_name}</p>
                                <button onClick={() => this.handleDelete(task.task_id)}>Delete</button>
                            </li>
                        ))
                    }
                </ul>
            </div>
        )
    }
}

export default App;