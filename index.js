const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

app.use(cors());

app.use(express.static('dist'));

app.use(express.json());
morgan.token('content', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan('tiny', { skip: function (req, res) { return req.method === 'POST' } }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content', { skip: function (req, res) { return req.method !== 'POST' } }));

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

app.post('/api/persons', (req, res) => {
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
        });

    });
    
    
});

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id).then(result => {
        if (result) {
            return res.status(204).end();
        } else {
            return res.status(404).json({ error: 'person not found' });
        }
    });
});


// Running the server...
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})