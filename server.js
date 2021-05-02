'use strict';
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const server = express();
const PORT = process.env.PORT || 5000;
const superagent = require('superagent');
server.use(cors());
server.set('view engine','ejs');
server.use(express.static('./public'));
server.use(express.urlencoded({extended: true}));
server.get('/',homePage);
server.get('/searches/new', searchNew);
server.post('/searches', searchSpeseficBook);
function rr(req, res) {
    res.send('you server is working')
 }

 function homePage(req, res, next) {
     res.render('pages/index', {'name': '<3'})
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
           
            let result = response.body.items.slice(0, 5);
           
            let formattedResutl = result.map(bookData =>{ 
              return  new Books(bookData)
            });
           
            res.render('pages/searches/show', {books: formattedResutl});
        })
        .catch(e => {throw Error('Cannot get data from the API')})
}
        server.listen(PORT, () =>
            console.log(`listening on ${PORT}`)
        );
   
        function Books(bookData) {
            this.title = bookData.volumeInfo.title ;
            this.authors =     bookData.volumeInfo.authors ? bookData.volumeInfo.authors[0]  : "Odai" ;
            this.description = bookData.volumeInfo.description ? bookData.volumeInfo.description : "This Book Without description";
            this.image_url = bookData.volumeInfo.imageLinks ? bookData.volumeInfo.imageLinks.smallThumbnail.replace(/HTTP:/i, 'https:') : "https://i.imgur.com/J5LVHEL.jpg";
        }