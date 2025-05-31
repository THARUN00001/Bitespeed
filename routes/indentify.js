const express = require('express');
const router = express.Router();

const {findOrCreateUser} = require("../database/database.js");

router.post('/identify', async(req, res) => {
	



  if (req.body.email === null) {
    req.body.email = ""
  }if (req.body.phoneNumber === null) {
    req.body.phoneNumber = ""
  }

	const email = req.body.email.trim();
	const phoneNumber = req.body.phoneNumber.trim();
	
if (!email && !phoneNumber ) {
    return res.status(400).json({ error: 'Email or phoneNumber required' });
  }



  try {
    const user = await findOrCreateUser({ email, phoneNumber });
   


      const emails = [];
      const phoneNumbers = [];
      const secondaryContactIds = [];
      let primaryID = []; 
     
      
      
 function constructResult(user) {
      for (let i = 0; i < user.length; i++) {
      const element = user[i];

      if(element.linkprecedence === "primary"){
        primaryID.push(element.id);
      }
      if(emails.includes(element.email) === false){
        emails.push(element.email);
      }
       if(phoneNumbers.includes(element.phonenumber) === false){
        phoneNumbers.push(element.phonenumber);
      }
      
      if(element.linkedid != null && element.linkprecedence === "secondary" && secondaryContactIds.includes(element.id) == false ){
        secondaryContactIds.push(element.id);
      }
      
    }
}

  constructResult(user);

    const result =  {
      "contact":{
      "primaryContactId": primaryID[0],
			"emails": emails, // first element being email of primary contact 
			"phoneNumbers": phoneNumbers, // first element being phoneNumber of primary contact
			"secondaryContactIds": secondaryContactIds // Array of all Contact IDs that are "secondary" to the primary contact  
      }
    }


    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'DATA NOT FOUND - Enter both email and phone number to create a new account, After creating account you can add both the details or either of them to complete your order' });
  }


	
});


module.exports = router;