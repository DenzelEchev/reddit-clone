const express = require('express')
const app = express()
const path = require('path')
const dotenv = require('dotenv').config()
const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const dbString = process.env.DB_STRING

MongoClient.connect(dbString, { useUnifiedTopology: true })
.then(client => {
    console.log('Connected to Database')
    const db = client.db('Demo Dat')
    const digiCollection = db.collection('Demo Day')

    nunjucks.configure('views', {
      autoescape: true,
      express: app
    });

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        db.collection('posts').find().toArray()
          .then(digimon => {
            res.render('index.njk', { digiData: digimon })
          })
          .catch(/* ... */)
      })

      app.post('/posts', (req, res) => {
        digiCollection.insertOne(req.body)
          .then(posts => {
            res.redirect('/')
          })
          .catch(error => console.error(error))
      })

      app.delete('/postDelete', (req, res) => {
        db.collection('posts').findOneAndDelete({name: req.body.name}, (err, result) => {
          if (err) return res.send(500, err)
          res.send('Message deleted!')
        })
      })

      const isProduction = process.env.NODE_ENV === 'production'
      const port = isProduction ? 7500 : 3000
      app.listen(port, function () {
        console.log(`listening on ${port}`)
      })
})