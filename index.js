const mongoose = require('mongoose');
const Models = require('./models.js');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const express = require('express');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/test', { useNewURLParser: true, useUnifiedTopology: true});
mongoose.connect( process.env.CONNECTION_URI, {
    useNewURLParser: true,
    useUnifiedTopology: true
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const {check, validationResult} = require('express-validator');
let allowedOrigins = ['https://localhost:8080', 'http://localhost:1234', 'http://testsite.com'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

let auth = require('./auth')(app);

const LocalStrategy = require('passport-local').Strategy;


fs = require('fs'), // import built in node modules fs and path
    path = require('path');


app.use(bodyParser.json());
app.use(morgan('common'))

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.get('/', (req, res) => {
    res.send('Welcome to information on Marvel movies');
});

app.get('/documentation', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
});

app.get('/movies', function (req, res) {
    Movies.find()
        .then(function (movies) {
            res.status(201).json(movies);
        })
        .catch(function (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({Title: req.params.Title})
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
 
app.get('/movies/genre/:genre', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({'Genre.Name': req.params.genre})
        .then((movie) => {
            res.status(201).json(movie.Genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/movies/directors/:DirectorName', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({'Director.Name': req.params.DirectorName})
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


app.get('/users/:Username', passport.authenticate("jwt", {session: false}), (req, res) => {
    Users.findOne({Username: req.params.Username})
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.post('/users',
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ],

    (req, res) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOne({Username: req.body.Username})
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.Username + 'already exists');
                } else {
                    Users
                        .create({
                            Username: req.body.Username,
                            Password: hashedPassword,
                            Email: req.body.Email,
                            Birthday: req.body.Birthday
                        })
                        .then((user) => {
                            res.status(201).json(user)
                        })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });


app.put('/users/:Username', [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric character - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], passport.authenticate('jwt', {session: false}), (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    Users.findOneAndUpdate({Username: req.params.Username}, {
            $set:
                {
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }
        },
        {new: true}, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.status(201).json(updatedUser);
            }
        });
});

app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username}, {
            $push: {FavouriteMovies: req.params.MovieID}
        },
        {new: true}, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate(
        {Username: req.params.Username},
        {
            $pull: {FavouriteMovies: req.params.MovieID},
        },
        {new: true},
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        }
    );
});

app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndRemove({Username: req.params.Username})
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, callback) => {
    console.log(username + '  ' + password);
    Users.findOne({Username: username}, (error, user) => {
        if (error) {
            console.log(error);
            return callback(error);
        }

        if (!user) {
            console.log('incorrect username');
            return callback(null, false, {message: 'Incorrect username.'});
        }

        if (!user.validatePassword(password)) {
            console.log('incorrect password');
            return callback(null, false, {message: 'Incorrect password.'});
        }

        console.log('finished');
        return callback(null, user);
    });
}));
app.use(express.static('public'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops, something broke!');
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
