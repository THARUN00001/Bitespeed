const { Pool } = require("pg");
// const { connect } = require("../routes/indentify");
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


pool.connect()
  .then(async (client) => {

    const createTable = `
       CREATE TABLE IF NOT EXISTS user_contacts (
        id SERIAL PRIMARY KEY,
        phoneNumber VARCHAR(20) DEFAULT '',
        email VARCHAR(255) DEFAULT '',
        linkedId INTEGER REFERENCES user_contacts(id) DEFAULT NULL,
        linkPrecedence VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP DEFAULT NULL
      );
    `
    await client.query(createTable);
    console.log('✅ Connected to the PostgreSQL database');
    client.release();


  })
  .catch(err => {
    console.error('❌ Database connection error:', err.stack);
  });




async function createUser(email, phoneNumber) {
  const query = `
    INSERT INTO user_contacts (
        email,
        phoneNumber,
        linkPrecedence)
        VALUES
        (
        $1, $2, $3
        )
         RETURNING *;
    `;
  const values = [ email,phoneNumber, 'primary'];
  const result = await pool.query(query, values);
  console.log('✅ User inserted with ID:', result.rows[0].id);
  return result.rows;  // return the inserted row
}


async function checkLinkedid(userDetails) {
  let primaryContact = [];

  for (let i = 0; i < userDetails.length; i++) {

    let primId = userDetails[i].linkedid;
    // console.log(primId);
    if (primId) {
      let primary = await pool.query(
        `
SELECT * FROM user_contacts
WHERE 
  (id = $1 AND $1 IS NOT NULL)

`,
        [primId]
      );
      primaryContact.push(primary.rows[0]);
    }
  }
  return primaryContact;
}


async function findOrCreateUser({ email, phoneNumber }) {
  const result = await pool.query(
    `
SELECT * FROM user_contacts
WHERE 
  (email = $1 AND $1 !='')
  OR
  (phonenumber = $2 AND $2 != '' );

`,
    [email, phoneNumber]
  );
  if (result.rows.length === 0) {
    const t = await createUser(email, phoneNumber);
    return t;
  }

const checkEmail = await result.rows.find(Obj => Obj.email === email);
const checkPhoneNumber = await result.rows.find(Obj => Obj.phonenumber === phoneNumber);
const userDetails = result.rows;
console.log(checkEmail);
console.log(checkPhoneNumber );
 



if(checkEmail === undefined){
  let  newUser = await createUser( email, '');
  result.rows.push(newUser);
}
if (checkPhoneNumber === undefined) {
 let  newUser = await createUser( '', phoneNumber);
result.rows.push(newUser);
}


  const linkedidContact = await checkLinkedid(userDetails);

  userDetails.push(linkedidContact[0]);

  return userDetails;

}


// async function findOrCreateUserWithEmail({email}){
//   const result = await pool.query(
// `
// SELECT * FROM user_contacts WHERE email = $1 
// `,
// [email]
// );
// checkResponse(result, email);
// }



module.exports = { pool, findOrCreateUser };