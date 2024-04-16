import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
    #database = {};

    constructor() {
        fs.readFile(databasePath, 'utf8')
            .then(data => {
                this.#database = JSON.parse(data)
            })
            .catch(() => {
                this.#persist();
            });
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database));
    }

    select(table, search) {
        let data = this.#database[table] ?? [];
        if (!search) {
            return data = this.#database[table] ?? [];
        }

        return this.#database[table].filter(task => task.title.toLowerCase().includes(search.toLowerCase()));
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data);
        } else {
            this.#database[table] = [data];
        }
        this.#persist();

        return data;
    }

    delete(table, id) {
        const taskIndex = this.#database[table].findIndex(db => db.id === id);

        if (taskIndex <= -1) {
            return 'Task not found.';
        }

        this.#database[table].splice(taskIndex, 1);

        this.#persist();

        return this.#database[table];

    }

    update(table, id, data) {
        const taskIndex = this.#database[table].findIndex(db => db.id === id);

        if (taskIndex <= -1) {
            return;
        }

        const oldTask = this.#database[table][taskIndex];
        
        if(data.complete){
            data.completed_at = data.complete;
            delete data.complete;
        }

        const newtask = {
            id,
            ...oldTask,
            ...data,
            updated_at: new Date()
        }

        this.#database[table].splice(taskIndex, 1, newtask);

        this.#persist();

        return this.#database[table][taskIndex];

    }
}