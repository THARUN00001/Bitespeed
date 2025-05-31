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




async function createUser(email, phoneNumber, linkPrecedence, linkedid) {
  const query = `
    INSERT INTO user_contacts (
        email,
        phoneNumber,
        linkPrecedence,
        linkedId)
        VALUES
        (
        $1, $2, $3, $4
        )
         RETURNING *;
    `;
  const values = [ email,phoneNumber, linkPrecedence, linkedid];
  const result = await pool.query(query, values);
  console.log('✅ User inserted with ID:', result.rows[0].id);
  return result.rows;  // return the inserted row
}


async function checkLinkedid(userDetails) {
  let primaryContact = [];

  for(let i = 0; i < userDetails.length; i++) {

    let primId = userDetails[i].linkedid;

    if (primId != null) {
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





async function update(linkedidContact, userDetails) {
    if (linkedidContact.length > 0) {
       let highTimeStamp ,lowestTimeStamp;
  highTimeStamp = linkedidContact[0].createdat;
  let primaryUserContact =  [linkedidContact[0]];
  let primaryId = primaryUserContact[0].id;
  for (let i = 0; i < linkedidContact.length; i++) {
 
  if(linkedidContact[i] != null && await userDetails.find(Obj => Obj.id != linkedidContact[i].id) ){ 
    
  if (linkedidContact[i].createdat > highTimeStamp) {
    
    
    highTimeStamp = linkedidContact[i].createdat;
    primaryUserContact = linkedidContact[i];
    // primaryId = linkedidContact[i].id;
    const update = await pool.query(
      `
      UPDATE user_contacts set linkedId = $1, linkPrecedence = $2, updatedAt = CURRENT_TIMESTAMP 
      where id = $3

      `,[primaryId , "secondary", linkedidContact[i].id]
    )
 
  }

    

    userDetails.push(linkedidContact[i]);
  }
  
  }
  }
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




  if (email && !phoneNumber ) {
      const emailResult = await pool.query(
    `
SELECT * FROM user_contacts
WHERE 
  (phonenumber = $1 AND $1 != '' );

`,
    [result.rows[0].phonenumber]
  );
  
  for (let i = 0; i < emailResult.rows.length; i++) {
    result.rows.push(emailResult.rows[i]);
    
  }

  
  }

  if (!email && phoneNumber) {
      const phoneResult = await pool.query(
    `
SELECT * FROM user_contacts
WHERE 
  (email = $1 AND $1 != '' );

`,
    [result.rows[0].email]
  );
    for (let i = 0; i < phoneResult.rows.length; i++) {
    result.rows.push(phoneResult.rows[i]);
    
  }
  }


  if (result.rows.length === 0) {
    const t = await createUser(email, phoneNumber, "primary", null);
    return t;
  }






const checkEmail = await result.rows.find(Obj => Obj.email === email);
const checkPhoneNumber = await result.rows.find(Obj => Obj.phonenumber === phoneNumber);
const userDetails = result.rows;





if(!checkEmail && checkPhoneNumber && email != ""){
  let  newUser = await createUser( email, phoneNumber, "secondary", checkPhoneNumber.id);

  result.rows.push(newUser[0]);
}
if (!checkPhoneNumber  && checkEmail && phoneNumber !="") {
 let  newUser = await createUser( email, phoneNumber, "secondary", checkEmail.id);
  result.rows.push(newUser[0]);
}



  const linkedidContact = await checkLinkedid(userDetails);
 if (linkedidContact) {
  await update(linkedidContact, userDetails);
 }

  
  




let thirdRelation = [];
for (let i = 0; i < userDetails.length; i++) {

  if (userDetails[i].linkprecedence === "primary") {
    thirdRelation.push(userDetails[i]);

  }
  
}


update(thirdRelation, userDetails)





const primaryIDs = [];

for (let i = 0; i < userDetails.length; i++) {
    if (userDetails[i].linkprecedence === "primary" && !primaryIDs.includes(userDetails[i].id)) {
      primaryIDs.push(userDetails[i].id);
    }
}

const finalDetails = await pool.query(

  `
  SELECT * FROM user_contacts WHERE
  linkedid = ANY($1::int[]);
  `,[primaryIDs]

)

// userDetails.push(finalDetails.rows);



const final_result = [ ...userDetails, ...finalDetails.rows ];

const resu = final_result.reduce((uniqueUsers, current) => {
  if (!uniqueUsers.find(item => item.id === current.id)) {
    uniqueUsers.push(current);
  }
  return uniqueUsers; // ← THIS was missing
}, []);



  console.log(resu);
  

  return resu;

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