const Express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// connection factory
const knex = require('knex');

const dbConfig = require('./knexfile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// create an express instance
const express = new Express();

const userController = require('./controller/user')

express.use(cors());
express.use(bodyParser.json());

// ** this is is client connection
const dbClient = knex(dbConfig);


function sendHealthStatus(req, resp) {
  resp.json({
    status: 'ok'
  })
  
}

function getVersion(req, res) {
  // send me a version
  res.json({version: '0.0.0'});           
}
function registerUser(request, response) {
  //get email
  const email = request.body.email;
  // get username
  const username = request.body.username;
  // get password
  const password = request.body.password;

  const hashedPassword = bcrypt.hashSync(password, 10);
  dbClient
    .table('users')
    .insert({
      // this must be same for database's column
      email: email,
      username: username,
      password: hashedPassword
    })
    .then(data => {
      response.json({
        status: 'success',
        data: {
          email: email,
          username: username,
        }
      })  
    })
    .catch(error => {
      response.json({
        status: 'fail',
      })
    })
}

// create a auth handler
function authenticate(request, response) {
  
  const username = request.body.username;
  const passwordFromJSON = request.body.password;

  dbClient
    .table('users')
    .first('password')
    .where('username', username)
    .then(data => {
      if (!data) {
        response.json({
          status: 'fail',
          message: 'User not found.'
        })
      } else {
        const password = data.password;
        const isMatch = bcrypt.compareSync(passwordFromJSON, password);
        if (isMatch) {
          // password matched
          response.json({
            status: 'success',
            accessToken: jwt.sign({
              username: username
            }, 'secret_key')
          })
        } else {
          response.json({
            status: 'fail',
            message: 'user not authenticated'
          })
        }
      }
      
    })
    .catch(error => {
      response.json({
        status: 'fail',
      })
    })
}

function getUsers(request, response) {
  dbClient
    .table('users')
    .select('email')
    .select('username')

    .then(data => {
      response.json({
        status: 'success',
        data: data
      })
    })
    .catch(error => {
      console.log(error)
      response.json({
        status: 'fail'
      })
    })
}




express.get('/api/health', userController.getUser)
express.get('/api/version', getVersion)
express.post('/api/auth', authenticate); // 1
express.post('/api/register', registerUser);
express.get('/api/users', getUsers)

express.listen(8000, 'localhost', () => {
  console.log("Server is running at ", 8000)
})


// migration in knex

