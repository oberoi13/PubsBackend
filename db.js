// db.js

const express = require('express');
const sql = require('mssql');
const cors = require('cors');


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Configure database connection
// const config = {
//   user: 'co-op-login',
//   password: '',
//   server: 'co-op-db-oberoik.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
//   database: 'Pubs',
//   options: {
//     encrypt: true, // Use encryption
//     trustServerCertificate: false, // Do not trust the server certificate
//     enableArithAbort: true, // Enable to avoid SQL injection attacks
//   },
//   };
const config = {
  user: 'Kiret',
  password:'Oberoi#123',
  server: 'ON44C03507573',
  database: 'Pubs',
  options: {
      trustServerCertificate: true,
      encrypt: true,
      enableArithAbort: true,
  }
};

// const config = {
//    //driver: 'msnodesqlv8',
//   // connectionString: 'Driver=SQL Server Native Client 11.0;Server=ON44C03507573\\MSSQLSERVER01;Database=Pubs;Trusted_Connection=yes;'
// connectionString: 'driver={SQL Server Native Client 11.0};Server=ON44C03507573;Database=Pubs;Trusted_Connection=yes;',

// };








 
// Driver={ODBC Driver 18 for SQL Server};
//Server=tcp:co-op-db-wang.database.windows.net,1433;Database=pubs;
//Uid=co-op-login;Pwd={your_password_here};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;
// Function to connect to database
// async function connectToDB() {
//     try {
//         await sql.connect(config);
//         console.log('Connected to Azure SQL Database');
//       } catch (err) {
//         console.error('Error connecting to Azure SQL Database:', err);
//       }
// }

// module.exports = {
//   connectToDB,
//   sql
// };
// Async function to connect to database
async function connectDB() {
  try {
      await sql.connect(config);
      console.log('Connected to Azure SQL Database');
  } catch (err) {
      console.error('Connection error:', err);
  }
}

// Route to fetch data
app.get('/api/authors', async (req, res) => {
  try {
      const result = await sql.query`SELECT * FROM authors`;
      res.json(result.recordset);
  } catch (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Error fetching data' });
  }
});
// DELETE endpoint to delete an author by ID
app.delete('/api/authors/:id', async (req, res) => {
  const authorId = req.params.id;

  try {
      // Ensure SQL injection prevention by parameterizing queries
      const result2= await sql.query`DELETE FROM titleauthor WHERe au_id=${authorId}`
      const result = await sql.query`DELETE FROM authors WHERE au_id = ${authorId}`;
      
      if (result.rowsAffected[0] === 0) {
          res.status(404).json({ error: 'Author not found' });
      } else {
          res.json({ message: 'Author deleted successfully' });
      }
  } catch (err) {
      console.error('Delete query error:', err);
      res.status(500).json({ error: 'Error deleting author' });
  }
});
app.put('/api/Edit/:id', async (req, res) => {
  const authorId = String(req.params.id);
  const updatedAuthor = req.body; // Assuming req.body contains the updated author object
console.log("ReqBody",req.body)
//console.log("Res",res)
  console.log('Received body:', updatedAuthor); // Log the req.body to console
console.log(authorId);

  try {
    const result = await sql.query`
      UPDATE authors 
      SET au_fname = ${updatedAuthor.au_fname}, 
          au_lname = ${updatedAuthor.au_lname}, 
          address = ${updatedAuthor.address}, 
          City = ${updatedAuthor.city}, 
          State = ${updatedAuthor.state}, 
          Zip = ${updatedAuthor.zip}, 
          phone=${updatedAuthor.phone}
           
      WHERE au_id = ${authorId}`;
      //contract = ${contract}
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ error: 'Author not found' });
    } else {
      res.json({ message: 'Author updated successfully' });
    }
  } catch (err) {
    console.error('Update query error:', err);
    res.status(500).json({ error: 'Error updating author' });
  }
});
app.post('/api/Add', async(request,result)=>{
  const newAuthor = request.body;
  console.log(newAuthor);
  try{
    const res = await sql.query`insert into authors (au_id,au_fname,au_lname,address,city,state,zip,contract,phone) values (${newAuthor.au_id},${newAuthor.au_fname},${newAuthor.au_lname},${newAuthor.address},${newAuthor.city},${newAuthor.state},${newAuthor.zip},${newAuthor.contract},${newAuthor.phone})`
    if (res.rowsAffected[0] === 0) {
      result.status(404).json({ error: 'Author add problems' });
    } else {
    await  result.json({ message: 'Author Added successfully' });
    }
  } catch (err) {
    console.error('isnert query error:', err);
    result.status(500).json({ error: 'Error Adding author' });
  }
});

// Route to fetch data
app.get('/api/books', async (req, res) => {
  try {
      const result = await sql.query`SELECT * FROM titles`;
      res.json(result.recordset);
  } catch (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Error fetching data' });
  }
});
app.get('/api/book/:id',async(req,res)=>{
  const id =String(req.params.id)
  console.log(id)
  try{
    const result =await sql.query`select title, au_fname,au_lname,authors.au_id from titles join titleauthor on titles.title_id = titleauthor.title_id join authors on authors.au_id=titleauthor.au_id where titles.title_id=${id}`
    res.json(result.recordset);
  } catch (err) {
      console.error('Query error:', err);
      res.status(500).json({ error: 'Error fetching data' });
  }
});
//Delete Association with book
app.delete('/api/DelBookAuthor', async (req, res) => {
  console.log(req.body)
  
  const authorId = req.body.au_id;
  const TitleID= req.body.title_id;
  console.log(authorId,TitleID)

  try {
      // Ensure SQL injection prevention by parameterizing queries
      // const result2= await sql.query`DELETE FROM titleauthor WHERe au_id=${authorId}`
      const result = await sql.query`Delete from titleauthor where title_id=${TitleID} and au_id=${authorId}`;
      
      if (result.rowsAffected[0] === 0) {
          res.status(404).json({ error: 'Author not associated to book' });
      } else {
          res.json({ message: 'Author deleted successfully from book' });
      }
  } catch (err) {
      console.error('Delete query error:', err);
      res.status(500).json({ error: 'Error deleting author from book' });
  }
});

//Add new Autor to book: post into title authors
app.post('/api/AddAuthtoBooks', async(request,result)=>{
  console.log(request.body)
  console.log(request.body.au_id)
  console.log(request.body.title_id)

   const authorId = String(request.body.au_id);
  const TitleID= String(request.body.title_id);
  console.log(authorId,TitleID);
  try{
    const res = await sql.query`INSERT INTO titleauthor(au_id,title_id) VALUES (${request.body.au_id},${request.body.title_id})
`
    if (res.rowsAffected[0] === 0) {
      result.status(404).json({ error: 'Author add problems' });
    } else {
    await  result.json({ message: 'Author Added successfully' });
    }
  } catch (err) {
    console.error('isnert query error:', err);
    result.status(500).json({ error: 'Error Adding author' });
  }
});
app.put('/api/EditBook/:id', async (req, res) => {
  const bookId = String(req.params.id);
  const updatedAuthor = req.body.updatedData; // Assuming req.body contains the updated author object
console.log("ReqBody",req.body)
//console.log("Res",res)
  console.log('Received body:', updatedAuthor); // Log the req.body to console
console.log(bookId);

  try {
    const result = await sql.query`
      UPDATE titles 
      SET title = ${updatedAuthor.title}, 
          type = ${updatedAuthor.type}, 
          price = ${updatedAuthor.price}, 
          ytd_sales = ${updatedAuthor.sale}, 
          pubdate = ${updatedAuthor.date}
          
           
      WHERE  title_id= ${bookId}`;
      //contract = ${contract}
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ error: 'Author not found' });
    } else {
      res.json({ message: 'Author updated successfully' });
    }
  } catch (err) {
    console.error('Update query error:', err);
    res.status(500).json({ error: 'Error updating author' });
  }
});

app.delete('/api/DelBook', async (req, res) => {
  console.log(req.body)
  
  
  const TitleID= req.body.title_id;
  console.log(TitleID)

  try {
      // Ensure SQL injection prevention by parameterizing queries
      // const result2= await sql.query`DELETE FROM titleauthor WHERe au_id=${authorId}`
       const result2 = await sql.query`Delete from titleauthor where title_id=${TitleID}`;
       const result3=await sql.query`delete from sales where title_id=${TitleID}`
      const result = await sql.query`Delete from titles where title_id=${TitleID}`
      if (result.rowsAffected[0] === 0) {
          res.status(404).json({ error: 'Book cant deleted' });
      } else {
          res.json({ message: 'Book  delete' });
      }
  } catch (err) {
      console.error('Delete query error:', err);
      res.status(500).json({ error: 'Error deleting author from book' });
  }
});
app.post('/api/AddBook', async(request,result)=>{
  const newAuthor = request.body.Data
  console.log(newAuthor);
  try{
    const res = await sql.query`insert into titles (title_id,title,type,price,ytd_sales,pubdate) values (${newAuthor.title_id},${newAuthor.title},${newAuthor.type},${newAuthor.price},${newAuthor.sales},${newAuthor.date})`
    if (res.rowsAffected[0] === 0) {
      result.status(404).json({ error: 'title add problems' });
    } else {
    await  result.json({ message: 'title Added successfully' });
    }
  } catch (err) {
    console.error('isnert query error:', err);
    result.status(500).json({ error: 'Error Adding title' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB(); // Connect to database when server starts
});