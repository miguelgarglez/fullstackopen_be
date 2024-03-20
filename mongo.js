const mongoose = require('mongoose')
const process = require('process');

if (process.argv.length<3) {
  console.log('give password or content of person as arguments')
  process.exit(1)
} else if (process.argv.length>5) {
  console.log('give only name and number as arguments')
  process.exit(1)
}

const password = process.argv[2]
let name = null
let number = null

if (process.argv.length === 5) {
  name = process.argv[3]
  number = process.argv[4]
}

const url =
  `mongodb+srv://fullstackopen:${password}@clusterphonebook.cz0qsio.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPhonebook`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (name !== null && number !== null) {

  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}