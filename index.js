const express = require('express');
morgan = require ('morgan');
fs = require('fs'), // import built in node modules fs and path
  path = require('path');
bodyParser = require('body-parser');
uuid = require('uuid');

const app = express();
app.use(bodyParser.json())

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let topMovies =[
                {title: 'Iron Man',
                    phase: '1'
                }
                {title: 'The Incredible Hulk',
                    phase: '1'
                }
                {title: 'Iron Man 2',
                    phase: '1'
                }
                {title: 'Thor',
                    phase: '1'
                }
                {title: 'Captain America: The First Avenger',
                    phase: '1'
                }
                {title: 'Marvel\'s The Avengers',
                    phase: '1'
                }
                {title: 'Iron Man 3',
                    phase: '2'
                }
                {title: 'Thor: The Dark World',
                    phase: '2'
                }
                {title: 'Captain America: The Winter Soldier',
                    phase: '2'
                }
                {title: 'Guardians of the Galaxy',
                    phase: '2'
                }
                
                ]

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

app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.genre.name === genreName).genre;

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
    const newUser = req.body;

    if (newUser.name) {
                newUser.id = uuid.v4();
                users.push(newUser);
                res.status(201).json(newUser)
    } else {
                res.status(400).send('user need names')
            }
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
