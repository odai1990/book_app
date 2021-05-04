DROP TABLE IF EXISTS book;
 CREATE TABLE book (
   id SERIAL PRIMARY KEY,
   title VARCHAR(255),
   description TEXT,
   img VARCHAR(255),
   isbn VARCHAR(255),
   auther VARCHAR(255)
 );