import mongoose from 'mongoose';

// import { DATABASE_URL } from './env.js';
import * as dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';

import express from 'express';
// import mockTasks from './data/mock.js';

import Task from './models/Task.js';

const app = express();

app.use(cors());
app.use(express.json());    // 앱 전체에서 express.json()을 사용하겠다고 선언함.

function asyncHandler(handler) {
    return async function (req, res) {
        try {
            await handler(req, res);
        } catch (e) {
            if (e.name === 'ValidationError') {
                res.status(400).send({ message: e.message });
            } else if (e.name === 'CastError') {
                res.status(404).send({ message: 'Cannot find given id.' });
            } else {
                res.status(500).send({ message: e.message });
            }
        }
    }
}

app.get('/tasks', asyncHandler(async (req, res) => {
    const sort = req.query.sort;
    const count = Number(req.query.count) || 0;

    const sortOption = {
        createdAt : sort === 'oldest' ? 'asc' : 'desc'
    };

    // find, sort, limit 모두 쿼리를 리턴하기 때문에 연결해서 사용 가능
    const tasks = await Task.find().sort(sortOption).limit(count);    // find()는 여러 객체를 가져옴.
    
    res.send(tasks);
/*    const compareFn =
        sort === 'oldest'
            ? (a, b) => a.createdAt - b.createdAt
            : (a, b) => b.createdAt - a.createdAt;
    
    let newTasks = mockTasks.sort(compareFn);

    if (count) {
        newTasks = newTasks.slice(0, count);
    }
    
    res.send(mockTasks);
*/
}));

app.get('/tasks/:id', asyncHandler(async (req, res) => {
    // const id = Number(req.params.id);
    // const task = mockTasks.find((task) => task.id === id);
    const id = req.params.id;   // mongoDB에서 사용하는 id는 문자열이므로 Number() 삭제
    const task = await Task.findById(id);   // mongoose는 findById 메소드 제공
    if (task) {
        res.send(task);
    } else {
        res.status(404).send({ message: 'Cannot find given id. '})
    }
}));

/*
app.post('/tasks', (req, res) => {
    const newTask = req.body;
    const ids = mockTasks.map((task) => task.id);
    newTask.id = Math.max(...ids) + 1;
    newTask.isComplete = false;
    newTask.createdAt = new Date();
    newTask.updatedAt = new Date();

    mockTasks.push(newTask);
    res.status(201).send(newTask);
});
*/

app.post('/tasks', asyncHandler(async (req, res) => {
    const newTask = await Task.create(req.body);
    res.status(201).send(newTask);
}));

/*
app.patch('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = mockTasks.find((task) => task.id === id);
    if (task) {
        Object.keys(req.body).forEach((key) => {
            task[key] = req.body[key];
        });
        task.updatedAt = new Date();
        res.send(task);
    } else {
        res.status(404).send({ message: 'Cannot find given id. '});
    }
});

app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = mockTasks.findIndex((task) => task.id === id);
    if (idx >= 0) {     // 해당 객체를 찾지 못하면 인덱스 대신 -1 반환
        mockTasks.splice(idx, 1); // 해당 idx 객체부터 1개 지우기
        res.sendStatus(204);
    } else {
        res.status(404).send({ message: 'Cannot find given id. '})
    }
});
*/

app.patch('/tasks/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findById(id);
    if (task) {
        Object.keys(req.body).forEach((key) => {
            task[key] = req.body[key];
        });
        await task.save();
        res.send(task);
    } else {
        res.status(404).send({ message: 'Cannot find given id. '});
    }
}));

app.delete('/tasks/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findByIdAndDelete(id);
    if (task) {
        res.sendStatus(204);
    } else {
        res.status(404).send({ message: 'Cannot find given id. '})
    }
}));

// app.listen(3000, () => console.log('Server Started'));
app.listen(process.env.PORT || 3000, () => console.log('Server Started'));

// mongoose.connect(DATABASE_URL).then(() => console.log('Connected to DB'));
mongoose.connect(process.env.DATABASE_URL).then(() => console.log('Connected to DB'));