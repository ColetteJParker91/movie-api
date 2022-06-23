const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/test',{use NewURLParser: true, useUnifiedTopology: true)};

const express = require('express');
app = express(),
                 app.use(body.parser.urlencoded({ extended: true}));

const bodyParser = require('body-parser'),
uuid = require('uuid');
morgan = require('morgan');
fs = require('fs'), // import built in node modules fs and path
path = require('path');

app.use(bodyParser.json());


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let users = [
             {
                 id: 1,
                 name: "Colette",
             password:"",
                 favoriteMovies: []
             },
             {
                 id: 2,
                 name: "John",
                 password: "",
                 favoriteMovies: ["Iron Man 2"]
             },
             ]

let movies =[
                {
                title: 'Iron Man',
                    phase: '1',
                    director: 'Jon Favreau',
                },
                {
                title: 'The Incredible Hulk',
                    phase: '1',
                    director: 'Louis Leterrier',
                },
                {
                title: 'Iron Man 2',
                    phase: '1',
                    director: 'Jon Favreau',
                },
                {
                title: 'Thor',
                    phase: '1',
                    director: 'Kenneth Branagh',
                },
                {
                title: 'Captain America: The First Avenger',
                    phase: '1',
                    director: 'Joe Johnston',
                },
                {
                title: 'Marvel\'s The Avengers',
                    phase: '1',
                    director: 'Joss Whedon',
                },
                {
                title: 'Iron Man 3',
                    phase: '2',
                    director: 'Shane Black',
                },
                {
                title: 'Thor: The Dark World',
                    phase: '2',
                    director: 'Alan Taylor',
                },
                {
                title: 'Captain America: The Winter Soldier',
                    phase: '2',
                    director: 'Anthony and Joe Russo',
                },
                {
                title: 'Guardians of the Galaxy',
                    phase: '2',
                    director: 'James Gunn',
                },
                
                ];

app.get('/', (req, res) => {
  res.send('Welcome to information on Marvel movies');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/movies/:title', (req, res) => {
    const {title} = req.params;
    const movie = movies.find(movie => movie.title === title);
    if (movie){
        res.status(200).json(movie);}
    else {
        res.status (400).send('no such movie')
    }
});

app.get('/movies/phase/:phaseNumber', (req, res) => {
    const { phaseNumber } = req.params;
    const phase = movies.find(movie => movie.phase.number === phaseNumber).phase;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre')
    }
});
        
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.director.name === directorName).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no such director')
            }
    });
    
                 app.post('/users', (req, res) => {
                   Users.findOne({ Username: req.body.Username })
                     .then((user) => {
                       if (user) {
                         return res.status(400).send(req.body.Username + 'already exists');
                       } else {
                         Users
                           .create({
                             Username: req.body.Username,
                             Password: req.body.Password,
                             Email: req.body.Email,
                             Birthday: req.body.Birthday
                           })
                           .then((user) =>{res.status(201).json(user) })
                         .catch((error) => {
                           console.error(error);
                           res.status(500).send('Error: ' + error);
                         })
                       }
                     })
                     .catch((error) => {
                       console.error(error);
                       res.status(500).send('Error: ' + error);
                     });
                 });

        
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
                user.name = updatedUser.name
                res.status(200).json(user);
    } else {
                res.status(400).send('no such user');
            }
    });
        
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
                user.favoriteMovies.push(movieTitle);
                res.status(200).send(`${movieTitle} has been added to user ${id}'s favorites`);
    } else {
                res.status(400).send('did not add to favorites');
            }
    });
         
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

                 // Checks to make sure user exists
    let user = users.find( user => user.id == id );

    if (user) {
                 user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
                 res.status(200).send(`${movieTitle} has been removed from users ${id}'s favorites`);
    } else {
                 res.status(400).send('did not remove');
             }
    });
           
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
                   users = users.filter( user => user.id != id);
                   res.status(200).send(`user ${id} has been deleted`);
    } else {
                   res.status(400).send('user has not been deleted');
               }
    });
        
app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oops, something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
