/* eslint-disable no-undef */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

app.use(cors());

app.use(express.static('dist'));

app.use(express.json());
morgan.token('content', function (req) { return JSON.stringify(req.body) })
app.use(morgan('tiny', { skip: function (req) { return req.method === 'POST' } }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content', { skip: function (req) { return req.method !== 'POST' } }));

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>');
});

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons);
    });
});

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person);
    });
});

app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`);
    });
});

app.post('/api/persons', (req, res, next) => {
    const body = req.body;
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        });
    }

    Person.findOne({ name: body.name }).then(person => {
        if (person) {
            return res.status(400).json({
                error: 'name must be unique'
            });
        }
        const newPerson = new Person({
            name: body.name,
            number: body.number,
        });
        newPerson.save().then(savedPerson => {
            res.json(savedPerson);
        }).catch(error => next(error));

    });
    
    
});

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id).then(result => {
        if (result) {
            return res.status(204).end();
        }
    }).catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body;
    const person = {
        name: body.name,
        number: body.number
    };
    Person.findByIdAndUpdate(
        req.params.id, 
        person,
        { new: true, runValidators: true, context: 'query'}
    ).then(updatedPerson => {
            res.json(updatedPerson);
        }).catch(error => next(error));
});

// debe estar el penúltimo middleware cargado
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// este debe ser el último middleware cargado
app.use(errorHandler)


// Running the server...
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})