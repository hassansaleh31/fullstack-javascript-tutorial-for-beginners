const express = require('express');
const app = express();
app.use(express.static('./to-do/build'));

const Pool = require('pg').Pool;

const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors())
app.use(bodyParser.json())

const pool = new Pool({
    user: 'postgres',
    host: 'postgres.localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: 5432,
})

const createTabelString = `
	CREATE TABLE IF NOT EXISTS tasks(
		task_id SERIAL PRIMARY KEY,
		task_name VARCHAR(255) NOT NULL,
		is_done boolean NOT NULL DEFAULT false
	);
`;

pool.query(createTabelString, function (err, res) {
    if (err) {
        console.error(err);
    } else {
        console.log(res);
    }
});

function createTask(name, callback) {
    pool.query('INSERT INTO tasks (task_name) VALUES ($1) RETURNING *;', [name], function (err, res) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, res.rows[0]);
        }
    });
}

function getAllTasks(callback) {
    pool.query('SELECT * FROM tasks;', function (err, res) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, res.rows);
        }
    });
}

function deleteTask(id, callback) {
    pool.query('DELETE FROM tasks WHERE task_id = $1', [id], function (err, res) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function updateTask(id, isDone, callback) {
    pool.query('UPDATE tasks SET is_done = $1 WHERE task_id = $2 RETURNING *;', [isDone, id], function (err, res) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, res.rows[0]);
        }
    });
}

// Handle PUT request to /api/tasks/
// Creates a new task and return it
app.put('/api/tasks/', function (req, res) {
    const name = req.body.name;
    createTask(name, function (err, task) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.send(JSON.stringify(task))
        }
    })
})

// Handle GET request to /api/tasks/
// Returns all tasks
app.get('/api/tasks/', function (req, res) {
    getAllTasks(function (err, tasks) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.send(JSON.stringify(tasks))
        }
    })
})

// Handle delete requests to /api/tasks/task_id
// Deletes a task and return a status code 200
app.delete('/api/tasks/:id', function (req, res) {
    const id = req.params.id;
    deleteTask(id, function (err) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.sendStatus(200)
        }
    })
})


// Handle post requests to /api/tasks/task_id
// Update task's is_done column and return it
app.post('/api/tasks/:id', function (req, res) {
    const id = req.params.id;
    const isDone = req.body.isDone;
    updateTask(id, isDone, function (err, task) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.send(JSON.stringify(task))
        }
    })
})

app.listen(3000, function () {
    console.log('Server started')
})