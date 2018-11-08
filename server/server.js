const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb').ObjectID;

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    
    let todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }). catch ( (e) => {
        res.status(400).send(e);
    });
});


app.get('/todos/:id', (req, res) => {
    const id = req.params.id;

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then( todo => {
        if(!todo) {
           return res.status(404).send();
        }
         res.send({todo});
        }).catch( e => {
            res.status(400).send();
        }); 
    });

module.exports = {app};


app.listen(3000, () => {
    console.log('Server started at port 3000');
});