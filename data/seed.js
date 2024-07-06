import mongoose from 'mongoose';
import data from './mock.js';
import Task from '../models/Task.js';
// import { DATABASE_URL } from '../env.js';
import * as dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.DATABASE_URL);

// await 키워드를 통해 비동기 작업을 동기화함.
await Task.deleteMany({});      // 조건에 맞는 데이터들 삭제
await Task.insertMany(data);    // 파라미터로 받는 데이터 삽입

mongoose.connection.close();