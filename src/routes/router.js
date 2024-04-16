import { buildRoutePath } from '../utils/build-route-path.js';
import { Database } from '../db/database.js';
import crypto, { randomUUID } from 'node:crypto';

const DB_NAME = 'tasks';

const db = new Database();

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query;

            const result = db.select(DB_NAME, search);

            if (!result.length) return res.writeHead(404).end(JSON.stringify({ error: "No task was found" }));

            return res.writeHead(200).end(JSON.stringify(result));
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            console.log('chamou o post')
            const { title, description } = req.body;

            if (!title || !description) {
                throw Error('Title and description are required.')
            }

            const task = {
                id: crypto.randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date()

            };

            db.insert(DB_NAME, task);
            return res.writeHead(201).end(JSON.stringify(task));

        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;
            const { title, description } = req.body;

            if (!title && !description) {
                throw Error('Business Error')
            }

            const task = db.update(DB_NAME, id, { title, description });

            if (!task) return res.writeHead(404).end(JSON.stringify({ error: 'Task not found.' }));

            return res.writeHead(200).end(JSON.stringify(task));
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;

            const error = db.delete(DB_NAME, id);

            if (error) return res.writeHead(404).end(JSON.stringify({ error }));

            return res.writeHead(204).end();

        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params;
            const { complete } = req.body;

            if (!complete) {
                throw Error('Business Error')
            }

            const task = db.update(DB_NAME, id, { complete });

            if (!task) return res.writeHead(404).end(JSON.stringify({ error: 'Task not found.' }));

            return res.writeHead(200).end(JSON.stringify(task));
        }
    }
]