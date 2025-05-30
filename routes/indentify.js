const express = require('express');
const router = express.Router();

const {findOrCreateUser} = require("../database/database.js");

router.post('/identify', async(req, res) => {
	

	const email = req.body.email.trim();
	const phoneNumber = req.body.phoneNumber.trim();
	
if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phoneNumber required' });
  }


  try {
    const user = await findOrCreateUser({ email, phoneNumber });
   


      const emails = [];
      const phoneNumbers = [];
      const secondaryContactIds = [];
      
    for (let i = 0; i < user.length; i++) {
      const element = user[i];

      
    }


    const result = {
      "contact":{
         	"primaryContatctId": 11,
			"emails": emails, // first element being email of primary contact 
			"phoneNumbers": phoneNumbers, // first element being phoneNumber of primary contact
			"secondaryContactIds": secondaryContactIds // Array of all Contact IDs that are "secondary" to the primary contact  
      }
    }


    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }


	
});


module.exports = router;