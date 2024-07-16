// db.js

const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Configure database connection
const config = {
  user: 'co-op-login',
  password: 'Kiret#444',
  server: 'co-op-db-oberoik.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
  database: 'Pubs',
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: false, // Do not trust the server certificate
    enableArithAbort: true, // Enable to avoid SQL injection attacks
  },
  };
//  qaNk2hRFs7NrndD
 
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



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB(); // Connect to database when server starts
});