const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: false
}];

beforeEach((done) => {
  Todo.deleteMany({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/id', () => {

  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect( (res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
    });

      it('should return 404 if todo not found', (done) => {

        let hexID = new ObjectID().toHexString();

        request(app)
          .get(`/todos/${hexID}`)
          .expect(404)
          .end(done);
      });

      it('should return 404 for not valid id', (done) => {
        request(app)
          .get('/todos/123')
          .expect(404)
          .end(done);
      });
});

describe('DELETE /todos/id', () => {
  
  it('should remove todo', (done) => {
    
    const hexID = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexID}`)
      .expect(200)
      .expect( res => {
        expect(res.body.todo._id).toBe(hexID);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        
        Todo.findById(hexID).then((todo) => {
          expect(todo).toBeFalsy();
        }).catch( e => done(e));

        done();
      });
  });

  it('should return 404 if todo not found', (done) => {

    const hexID = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${hexID}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if Object id is not valid', (done) => {

    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done);
  });
});


describe('PATCH /todos/:id', () => {

  it('should update the todo', (done) => {
    const id = todos[0]._id.toHexString();

    const text = "Some new text";

    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        completed: true
      })
      .expect(200)
      .expect( res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
      })
      .end(done);
  });

  it('should clear the completedAt when todo is not completed', (done) => {
    const id = todos[1]._id.toHexString();

    const text = "Some new text!!!!!";

    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        completed: false
      })
      .expect(200)
      .expect( res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
  });

});
