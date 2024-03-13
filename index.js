const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());
morgan.token('content', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan('tiny', { skip: function (req, res) { return req.method === 'POST' } }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content', { skip: function (req, res) { return req.method !== 'POST' } }));

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const person = persons.find(person => person.id === id);
    if (person) {
        res.json(person);
    } else {
        res.status(404).end();
    }
});

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`);
});

app.post('/api/persons', (req, res) => {
    const body = req.body;
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        });
    } else if (persons.find(person => person.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        });
    }
    const person = {
        id: Math.floor(Math.random() * 10000),
        name: body.name,
        number: body.number
    };
    persons = persons.concat(person);
    res.json(person);
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    persons = persons.filter(person => person.id !== id);
    res.status(204).end();
});


// Running the server...
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})