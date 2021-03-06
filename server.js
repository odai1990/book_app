'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const pg = require('pg');
const server = express();
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
const PORT = process.env.PORT || 5000;
const superagent = require('superagent');
const methodOverride = require('method-override');

// const client = new pg.Client(process.env.DATABASE_URL);

server.use(cors());
server.set('view engine', 'ejs');
server.use(express.static('./public'));


server.use(methodOverride('_method'));
server.use(express.urlencoded({ extended: true }));
server.get('/', homePage);
server.get('/searches/new', searchNew);
server.post('/searches', searchSpeseficBook);
server.post('/SaveToDataBase', SaveToDataBase);
server.get('/showOneBook/:id', showOneBook);
server.delete('/delete/:id', deleteBook);
server.put('/update/:id', updateBook);


function rr(req, res) {
  res.send('you server is working')
}

function homePage(req, res, next) {

  let SQL = `Select * from book`;
  client.query(SQL)
    .then(result => {
      console.log(result.rows)
      res.render('pages/index', { books: result.rows });
    })

}
function showOneBook(req, res, next) {


  let SQL = `SELECT * FROM book WHERE id=$1;`;
  let safeValue = [req.params.id]
  client.query(SQL, safeValue)
    .then(result => {
      res.render('pages/books/detail', { data: result.rows[0] });
    })


}




function searchNew(req, res, next) {
  res.render('pages/searches/new')
}



function searchSpeseficBook(req, res, next) {


  let Name = req.body.Name;
  let cat = req.body.cat;
  let url = `https://www.googleapis.com/books/v1/volumes?q=+${cat}:${Name}`;
  superagent.get(url)
    .then(response => {
      let result = response.body.items.slice(0, 10);
      let formattedResutl = result.map(bookData => {
        return new Books(bookData)
      });
      res.render('pages/searches/show', { books: formattedResutl });
    })
    .catch(e => { throw Error('Cannot get data from the API') })
}

function SaveToDataBase(req, res, next) {

  let { img, title, description, isbn, auther } = req.body;
  let SQL = `INSERT INTO book (img,title,description,isbn,auther) VALUES ($1,$2,$3,$4,$5) RETURNING *;`;
  let safeValues = [img, title, description, isbn, auther];
  client.query(SQL, safeValues)
    .then(result => {
      res.redirect(`/`);
    });

}



client.connect()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`listening on ${PORT}`)
    );
  })




function Books(bookData) {
  this.title = bookData.volumeInfo.title;
  this.authors = bookData.volumeInfo.authors ? bookData.volumeInfo.authors[0] : "N/A";
  this.description = bookData.volumeInfo.description ? bookData.volumeInfo.description : "This Book Without description";
  this.image_url = bookData.volumeInfo.imageLinks ? bookData.volumeInfo.imageLinks.smallThumbnail.replace(/HTTP:/i, 'https:') : "https://i.imgur.com/J5LVHEL.jpg";
  this.isbn = bookData.volumeInfo.industryIdentifiers ? bookData.volumeInfo.industryIdentifiers[0].identifier : 'no';
}




function deleteBook(req, res) {
  let SQL = `DELETE FROM book WHERE id=$1;`;
  let value = [req.params.id];
  client.query(SQL, value)
    .then(res.redirect('/'))
}


function updateBook(req, res) {
  let { img, title, description, isbn, auther } = req.body;
  let SQL = `UPDATE book SET img=$1,title=$2,description=$3,isbn=$4,auther=$5 WHERE id=$6;`;
  let safeValues = [img, title, description, isbn, auther, req.params.id];
  client.query(SQL, safeValues)
    .then(() => {
      res.redirect(`/showOneBook/${req.params.id}`);
    })
}