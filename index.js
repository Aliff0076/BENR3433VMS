const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const dotenv = require('dotenv'); // Add dotenv for environment variables
dotenv.config(); // Load environment variables from .env file
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const jwt = require('jsonwebtoken');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Aliff:BENR3433@cluster2023.kt0fiek.mongodb.net//benr3433?retryWrites=true&w=majority";
const mongoURI = process.env.MONGODB_URI;
const dbName = "benr3433";
const usersCollectionDB = "users";
const visitorsCollectionDB = "visitors";
const { ObjectId } = require('mongodb');


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

client.connect().then(() => {
  console.log('Connected to MongoDB');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Information Security',
      version: '1.0.0',
      description: 'School Visitor Management',
    },
    servers: [
      {
        url:'https://schoolvisitor3433.azurewebsites.net', // Update with your Azure Web App URL  //'http://localhost:3000'
        description: 'Visitor Management',
      },
    ],
  },
  apis: ['./swagger.js'], 
};


const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/Group10-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// const users = [
//   { username: 'khairul', password: '4102BQD' }
// ];

// app.get('/', (req, res) => {
//   res.render('login');
// });

// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Connect to the MongoDB database
//     await client.connect();
//     const db = client.db(dbName);
    
//     // Query the users collection in MongoDB
//     const dbUser = await db.collection(usersCollectionDB).findOne({ username, password });

//     // Check if the user is in the predefined users array
//     const predefinedUser = users.find(user => user.username === username && user.password === password);

//     if (dbUser || predefinedUser) {
//       res.redirect('/Group10-docs');
//     } else {
//       // Authentication failed
//       res.send('Invalid username or password.');
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).send('Internal Server Error');
//   } finally {
//     await client.close();
//   }
// });

app.use(express.json());
let dbUsers = [
  {
    username: "aliffkhairul",
    password: "0987654321",
    name: "aliffaizat",
    email: "alifjr763@gmail.com",
    role  : "user"
  },
  {
    username: "admin123",
    password: "@schooladmin",
    email : "admin@example.com",
    role: "admin"
  }
]
let dbVisitors = [
  {
    visitorname: "Jenny Kim",
    visitorpass: "Jenny123",
    id: "090909048454",
    phoneNumber: "0987654321",
    email: "jenniebp@example.com",
    appointmentDate: "2023-06-22",
    carPlate: "XYZ2987",
    purpose: "Mesyuarat PIBG",
    destination:"Fakulti Mekanikal",
    registeredBy: "Albino Rafael"
  },

];

app.post('/userlogin', (req, res) => {
  const data = req.body;
  const user = userlogin(data.username, data.password);

  if (user) {
    const token = generateToken(user, 'user');
    res.send({
      Status: "Success",
      usertoken: token,
    });
  } else {
    res.send({ error: "Unauthorized. Invalid credentials for user access." });
  }
});

app.post('/adminlogin', (req, res) => {
  const data = req.body;
  const user = userlogin(data.username, data.password);

  if (user && data.username === 'admin123' && data.password === '@schooladmin') {
    const token = generateToken(user, 'admin');
    res.send({
      Status: "Success",
      admintoken: token,
      Message: "You may close this tab now."
    });
  } else if (user) {
    res.send({ error: "Unauthorized. Invalid credentials for admin access." });
  } else {
    res.send({ error: "User not found" });
  }
});


app.get('/Administrator', (req, res) => {
  res.status(200).send('Login and Generate token at https://schoolvisitor3433.azurewebsites.net/adminlogin' );
});

app.get('/', (req, res) => {
  res.redirect('/Group10-docs');
});

app.get('/adminlogin', (req, res) => {
  res.render('login'); // Assuming you have a view engine set up for rendering
});


app.post('/register', async (req, res) => {
  try {
    const data = req.body;
    const username = data.username;
    
    // Check if the username already exists
    const match = dbUsers.find(element => element.username === username);
    
    if (match) {
      res.send("Error! User already registered.");
    } else {
      // Assuming the register function adds the user to the dbUsers array
      const result = await register(
        data.username,
        data.password,
        data.name,
        data.email,
      );

      if (result.status === 'Registration successful!') {
        // Assuming the updateUsersCollection function updates the MongoDB collection
        await updateUsersCollection();
      }

      res.send(result);
    }
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addvisitors', verifyToken, async (req, res) => {
  if (req.user.role === 'user') {
    let data = req.body;
    let id = data.id;
    let match = dbVisitors.find(element => element.idnumber === id);
    if (match) {
    res.send("Error! Visitor data already in the system.");
    } else 
    {
      let result = await addvisitor(
        data.visitorname,
        data.id, 
        data.visitorpass,
        data.phoneNumber,
        data.email,
        data.appointmentDate,
        data.carPlate,
        data.purpose,
        data.destination,
        data.registeredBy
      );
      if (result === 'Visitor registration successful!') {
        await updateVisitorsCollection(); // Update the visitors collection in MongoDB
      }
      res.send(result);
    }
  } else {
    res.send("Unauthorized");
  }
});

app.get('/visitorinfo', verifyToken, async (req, res) => {
  let client;

  try {
    // Connect to the MongoDB server
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();

    if (req.user.role === 'admin' || req.user.role === 'security') {
      const visitorsCursor = client
        .db("benr3433")
        .collection("visitors")
        .find();
      const visitors = await visitorsCursor.toArray();
      res.send(visitors);
    } else if (req.user.role === 'user') {
      res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error('Error retrieving visitor information:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection
    if (client) {
      await client.close();
    }
  }
});

app.get('/allusers', verifyToken, async (req, res) => {
  let client;

  try {
    // Connect to the MongoDB server
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();

    // Check if the user is an admin
    if (req.user.role === 'admin') {
      const usersCursor = client
        .db("benr3433")
        .collection("users") // Change to the actual collection name for users
        .find();
      const users = await usersCursor.toArray();
      res.send(users);
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error('Error retrieving user information:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection
    if (client) {
      await client.close();
    }
  }
});

app.get('/visitorpass', async (req, res) => {
  let client;

  try {
    // Connect to the MongoDB server
    client = new MongoClient(uri, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();

    // Extract visitor ID from query parameters
    const visitorId = req.query.id;

    if (!visitorId) {
      return res.status(400).send('Visitor ID is required in the query parameters');
    }

    const visitor = await client
      .db('benr3433')
      .collection('visitors')
      .findOne({ _id: ObjectId(visitorId) });

    if (visitor) {
      res.send(visitor); // Directly send the entire visitor pass object
    } else {
      res.status(404).send('Visitor not found');
    }
  } catch (error) {
    console.error('Error retrieving visitor pass:', error);
    res.status(500).send('Internal server error');
  } finally {
    // Close the MongoDB connection
    if (client) {
      await client.close();
    }
  }
});


app.patch('/editvisitor/:id', verifyToken, async (req, res) => {
  const visitorId = req.params.id;
  const updateData = req.body;

  try {
    const visitorsCollection = client.db(dbName).collection(visitorsCollectionDB);

    if (!visitorId) {
      res.status(400).send('Invalid visitor ID');
      return;
    }

    const result = await visitorsCollection.findOneAndUpdate(
      { _id: new ObjectId(visitorId) },
      { $set: updateData },
      { returnOriginal: false }
    );

    if (!result.value) {
      res.status(404).send('Visitor not found');
    } else {
      await updateVisitorsCollection(); // Update the visitors collection in MongoDB
      res.send('Visitor info updated successfully');
    }
  } catch (error) {
    console.error('Error updating visitor info:', error);
    res.status(500).send('An error occurred while updating the visitor info');
  }
});

app.delete('/deletevisitor/:id', verifyToken, async (req, res) => {
  if (req.user.role === 'user') {
    const visitorId = req.params.id;

    try {
      const visitorsCollection = client.db(dbName).collection(visitorsCollectionDB);
      const result = await visitorsCollection.deleteOne({ _id: new ObjectId(visitorId) });

      if (result.deletedCount === 0) {
        res.status(404).send('Visitor not found');
      } else {
        await updateVisitorsCollection(); // Update the visitors collection in MongoDB
        res.send('Visitor deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting visitor:', error);
      res.status(500).send('An error occurred while deleting the visitor');
    }
  } else {
    res.status(403).send('Unauthorized');
  }
});


app.post('/checkin', verifyToken, async (req, res) => {
  if (req.user.role !== 'security') {
    return res.status(401).send('Unauthorized');
  }

  const { visitorpass, carplate } = req.body;
  const visitor = dbVisitors.find(visitor => visitor.visitorpass === visitorpass);

  if (!visitor) {
    return res.status(404).send('Visitor not found');
  }

  const gmt8Time = moment().tz('GMT+8').format('YYYY-MM-DD HH:mm:ss');
  visitor.checkinTime = gmt8Time;
  visitor.carPlate = carplate;

  // Insert or update the check-in data in the RecordTime collection
  try {
    await visitingtime(visitorpass, visitor.visitorname, visitor.checkinTime);
    res.send(`Check-in recorded for visitor: ${visitor.visitorname}
      Check-in time: ${visitor.checkinTime}
      Car plate number: ${carplate}`);
  } catch (error) {
    console.error('Error inserting/updating RecordTime:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/checkout', verifyToken, async (req, res) => {
  if (req.user.role !== 'security') {
    return res.status(401).send('Unauthorized');
  }

  const { visitorpass } = req.body;
  const visitor = dbVisitors.find(visitor => visitor.visitorpass === visitorpass);

  if (!visitor) {
    return res.status(404).send('Visitor not found');
  }

  if (!visitor.checkinTime) {
    return res.send('Visitor has not checked in');
  }

  const gmt8Time = moment().tz('GMT+8').format('YYYY-MM-DD HH:mm:ss');
  const checkinTime = moment(visitor.checkinTime, 'YYYY-MM-DD HH:mm:ss');
  const checkoutTime = moment(gmt8Time, 'YYYY-MM-DD HH:mm:ss');
  visitor.checkoutTime = gmt8Time;

  // Update the check-out time in the RecordTime collection
  try {
    await visitingtime(visitorpass, visitor.visitorname, visitor.checkinTime, visitor.checkoutTime);
    res.send(`Checkout recorded for visitor: ${visitor.visitorname}
      Checkout time: ${visitor.checkoutTime}`);
  } catch (error) {
    console.error('Error inserting/updating RecordTime:', error);
    res.status(500).send('Internal Server Error');
  }
});

function userlogin(loginuser, loginpassword) {
  console.log("Someone is logging in!", loginuser, loginpassword); // Display mesage
  const user = dbUsers.find(user => user.username === loginuser && user.password === loginpassword);
  if (user) {
    return user;
  } else {
    return { error: "User not found" };
  }
}


function register(newusername, newpassword, newname, newemail,newrole) {
  let match = dbUsers.find(element => element.username === newusername);
  if (match) {
    return "Error! Username is already taken.";
  } else  {
    const newUser = {
      username: newusername,
      password: newpassword,
      name: newname,
      email: newemail,
      role: newrole
    };
    dbUsers.push(newUser);
    return {
      status: "Registration successful!",
      user: newUser
    };
  }
}

function generateVisitorPass() {
  // Generate 4 random numbers
  const randomNumbers = Math.floor(1000 + Math.random() * 9000);

  // Combine 'visitor' and random numbers to form the visitorpass
  const visitorpass = `visitor${randomNumbers}`;

  return visitorpass;
}

// Your addvisitor function
async function addvisitor(name, id, phoneNumber, email, appointmentDate, carPlate, purpose, destination, registeredBy) {
  try {
    // Check if the visitor with the same ID already exists
    let match = dbVisitors.find(element => element.idnumber === id);
    if (match) {
      return { Status: "Error! Visitor data already in the system." };
    } else {
      // Generate a visitorpass as a combination of 'visitor' and 4 random numbers
      const visitorpass = generateVisitorPass();

      // Create a new visitor object
      const newVisitor = {
        visitorname: name,
        idnumber: id,
        phoneNumber: phoneNumber,
        email: email,
        date: appointmentDate,
        carPlate: carPlate,
        purpose: purpose,
        destination: destination,
        registerBy: registeredBy
      };

      // Add the new visitor to the database
      dbVisitors.push(newVisitor);

      // Update MongoDB collection
      await updateVisitorsCollection(newVisitor);

      // Return the generated visitorpass
      return { Status: "Visitor registration successful!", visitorpass: visitorpass };
    }
  } catch (error) {
    console.error('Error in addvisitor:', error);
    return { Status: "Error! Failed to register visitor." };
  }
}

const { ObjectId } = require('mongodb');

async function updateUsersCollection() {
  try {
    const usersCollection = client.db(dbName).collection(usersCollectionDB);

    for (const user of dbUsers) {
      const existingUser = await usersCollection.findOne({ _id: user._id });

      if (existingUser) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: user },
          { upsert: true }
        );
      } else {
        if (!user._id) {
          user._id = new ObjectId(); // Generate a new ObjectId only if it doesn't exist
        }
        await usersCollection.insertOne(user);
      }
    }

    console.log('Users collection updated successfully');
  } catch (error) {
    console.error('Error updating users collection:', error);
  }
}

async function updateVisitorsCollection() {
  try {
    const visitorsCollection = client.db(dbName).collection(visitorsCollectionDB);

    for (const visitor of dbVisitors) {
      const existingVisitor = await visitorsCollection.findOne({ _id: visitor._id });

      if (existingVisitor) {
        await visitorsCollection.updateOne(
          { _id: visitor._id },
          { $set: visitor },
          { upsert: true }
        );
      } else {
        if (!visitor._id) {
          visitor._id = new ObjectId(); // Generate a new ObjectId only if it doesn't exist
        }
        await visitorsCollection.insertOne(visitor);
      }
    }

    console.log('Visitors collection updated successfully');
  } catch (error) {
    console.error('Error updating visitors collection:', error);
  }
}


async function visitingtime(visitorPass, visitorName, checkinTime, checkoutTime) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const RecordCollectionDB = db.collection('RecordTime');
    // Check if the visitor record already exists
    const existingRecord = await RecordCollectionDB.findOne({ visitorpass: visitorPass });

    if (existingRecord) {
      // Update the existing record with the visitor name and checkout time
      await RecordCollectionDB.updateOne(
        { visitorpass: visitorPass },
        { $set: { visitorName: visitorName, checkoutTime: checkoutTime } }
      );
      console.log('RecordTime updated successfully');
    } else {
      // Create a new document for the visitor
      const document = {
        visitorpass: visitorPass,
        visitorName: visitorName,
        checkinTime: checkinTime,
        checkoutTime: checkoutTime
      };
      // Insert the document
      await RecordCollectionDB.insertOne(document);
      console.log('RecordTime inserted successfully');
    }
    // Close the connection
    client.close();
  } catch (error) {
    console.error('Error inserting/updating RecordTime:', error);
  }
}

function generateToken(userProfile, role) {
  const payload = {
    userProfile,
    role
  };
  return jwt.sign(payload, 'admin', 
  { expiresIn: 30 * 60 });
}

function verifyToken(req, res, next) {
  let header = req.headers.authorization;
  let token = header.split(' ')[1];

  jwt.verify(token, 'admin', function (err, decoded) {
    if (err) {
      res.send("Invalid Token");
    } else {
      req.user = decoded;
      next();
    }
  });
}


app.listen(port, () => {
  console.log(`listening on 192.168.0.12 port ${port}`);
});

}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});