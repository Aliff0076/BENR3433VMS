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
      description: 'Visitor Management',
    },
    servers: [
      {
        url:'https://schoolvisitor3433.azurewebsites.net', // Update with your Azure Web App URL 
        description: 'Visitor Management Websites',
        // url:'http://localhost:3000', // Update with your Azure Web App URL  // testing
        // description: 'Visitor Management Websites',
      },
    ],
  },
  apis: ['./swagger.js'], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/Group10-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
let dbUsers = [
  {
    username: "admin123",
    password: "@schooladmin",
    email : "admin@example.com",
    role: "admin"
  },
  {
    username: "security123",
    password: "1qaz2wsx",
    email: "Pak guard.com",
    role  : "security"
  }
]
let dbVisitors = [{}];

app.post('/userlogin', (req, res) => {
  const data = req.query;
  const userWithRole = userlogin(data.username, data.password);

  if (userWithRole) {
    const { user, role } = userWithRole;
    const token = generateToken(user, role);

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
    // Admin login successful, redirect to /allusers
    res.redirect('/allusers?admin=true'); // Add query parameter to indicate admin status
  } else {
    res.status(401).send({ error: "Unauthorized. Invalid credentials for admin access." });
  }
});


app.get('/Administrator', (req, res) => {
  res.status(200).send('Login and Generate token at https://schoolvisitor3433.azurewebsites.net/adminlogin' );
});

app.get('/', (req, res) => {
  res.redirect('/Group10-docs');
});

app.get('/adminlogin', (req, res) => {
  res.render('login');
});

app.post('/test/register', async (req, res) => {
  try {
    const data = req.query;
    const username = data.username;
    
    // Check if the username already exists
    const match = dbUsers.find(element => element.username === username);
    
    if (match) {
      res.send("Error! User already registered.");
    } else {
      
      const result = await register(
        data.username,
        data.password,
        data.Hostname,
        data.email,
        data.hostNumber
      );

      if (result.status === 'Registration successful!') {
        
        await updateUsersCollection();
      }

      res.send(result);
    }
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/host/register', verifyToken,async (req, res) => {
  if (req.user.role === 'security') {
    let data = req.query;
    let username = data.username;
    let match = dbUsers.find(element => element.username === username);
    if (match) {
      res.send("Error! User already registered.");
    } else {
      let result = await register(
        data.username,
        data.password,
        data.Hostname,
        data.email,
        data.hostNumber
      );
      if (result.status === 'Registration successful!') {
        await updateUsersCollection(); 
      }
      res.send(result);
    }
  } else {
    res.send("Unauthorized");
  }
});

app.post('/addvisitors', verifyToken, async (req, res) => {
  if (req.user.role === 'user') {
    let data = req.query;
    let id = data.id;
    let match = dbVisitors.find(element => element.idnumber === id);
    if (match) {
    res.send("Error! Visitor data already in the system.");
    } else 
    {
      let result = await addvisitor(
        data.visitorname,
        data.id, 
        data.phoneNumber,
        data.appointmentDate,
        data.carPlate,
        data.Block,
        data.HouseUnit,
        data.Hostname,
        data.hostNumber
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

    if (req.user.role === 'admin' || req.user.role === 'user') {
      const visitorsCursor = client
        .db("benr3433")
        .collection("visitors")
        .find();
      const visitors = await visitorsCursor.toArray();
      res.send(visitors);
    } else {
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

app.get('/allusers', async (req, res) => {
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
  
    if (req.query.admin === 'true') {
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

    const visitorName = req.query.visitorname;

    if (!visitorName) {
      return res.status(400).send('Visitor name is required in the query parameters');
    }

    // Use a case-insensitive regex for searching by name
    const regex = new RegExp(`^${visitorName}$`, 'i');

    const visitor = await client
      .db('benr3433')
      .collection('visitors')
      .findOne({ visitorname: regex });

    if (visitor) {
      res.send(visitor);
    } else {
      res.status(404).send('Visitor not found');
    }
  } catch (error) {
    console.error('Error retrieving visitor information by name:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection
    if (client) {
      await client.close();
    }
  }
});

app.patch('/manage-accounts', verifyToken, async (req, res) => {
  let client;

  try {
    if (req.user.role === 'admin') {
      const { username, newhostNumber } = req.query;

      if (!username || !newhostNumber) {
        return res.status(400).send('Bad Request: Missing parameters');
      }

      // Connect to the MongoDB server
      client = new MongoClient(uri, {
        serverApi: {
          version: '1',
          strict: true,
          deprecationErrors: true,
        },
      });
      await client.connect();

      const user = await client.db('benr3433').collection('users').findOne({ username });

      if (!user) {
        return res.status(404).send('User not found');
      }

      // Update the user's contact with the new host number
      await client.db('benr3433').collection('users')
        .updateOne({ username }, { $set: { contact: newhostNumber } });

      // Retrieve the updated user after the update
      const updatedUser = await client.db('benr3433').collection('users').findOne({ username });

      res.send(`HostNumber updated successfully for user: ${username}. Updated contact: ${updatedUser.contact}`);
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error('Error in managing accounts:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection
    if (client) {
      await client.close();
    }
  }
});

app.get('/get-Number', verifyToken, async (req, res) => {
  let client;

  try {
    if (req.user.role === 'security') {
      const { visitorpass } = req.query;

      if (!visitorpass) {
        return res.status(400).send('Bad Request: Missing parameter');
      }

      // Connect to the MongoDB server
      client = new MongoClient(uri, {
        serverApi: {
          version: '1',
          strict: true,
          deprecationErrors: true,
        },
      });
      await client.connect();

      const visitor = await client.db('benr3433').collection('visitors')
        .findOne({ visitorpass });

      if (visitor) {
        res.send({ hostNumber: visitor.Hostnumber });
      } else {
        res.status(404).send('Visitor not found');
      }
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error('Error retrieving hostNumber:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection
    if (client) {
      await client.close();
    }
  }
});



function userlogin(loginuser, loginpassword) {
  console.log("Someone is logging in!", loginuser, loginpassword); // Display message
  const user = dbUsers.find(user => user.username === loginuser && user.password === loginpassword);

  if (user) {
    if (loginuser === 'security123' && loginpassword === '1qaz2wsx') {
      return { user, role: 'security' };
    } else if (loginuser === 'admin123' && loginpassword === '@schooladmin') {
      return { user, role: 'admin' };
    } else {
      return { user, role: 'user' };
    }
  } else {
    return null;  // Return null when username and password do not match
  }
}



function register(newusername, newpassword, newname, newemail,newhostNumber) {
  let match = dbUsers.find(element => element.username === newusername);
  if (match) {
    return "Error! Username is already taken.";
  } else  {
    const newUser = {
      username: newusername,
      password: newpassword,
      Hostname: newname,
      email: newemail,
      contact: newhostNumber
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
async function addvisitor(name, id, phoneNumber, appointmentDate, carPlate, Block, HouseUnit, Hostname, hostNumber) {
  try {
    // Check if the visitor with the same ID already exists
    let match = dbVisitors.find(element => element.idnumber === id);
    if (match) {
      return { Status: "Error! Visitor data already in the system." };
    } else {
      // Check if the hostNumber provided during registration matches any user's hostNumber
      let userMatch = dbUsers.find(user => user.contact === hostNumber);
      if (!userMatch) {
        return { Status: "Error! Invalid hostNumber. User not found." };
      }

      // Generate a visitorpass as a combination of 'visitor' and 4 random numbers
      const visitorpass = generateVisitorPass();

      // Create a new visitor object
      const newVisitor = {
        visitorname: name,
        idnumber: id,
        phoneNumber: phoneNumber,
        appointmentDate: appointmentDate,
        carPlate: carPlate,
        Block: Block,
        HouseUnit: HouseUnit,
        Hostname: Hostname,
        Hostnumber: hostNumber,
        visitorpass: visitorpass,
      }
      // Add the new visitor to the database
      dbVisitors.push(newVisitor);

      // Update MongoDB collection
      await updateVisitorsCollection(newVisitor);

      // Return the generated visitorpass
      console.log('Visitor added successfully:', newVisitor);
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
        visitor._id = new ObjectId(); // Generate a new ObjectId
        await visitorsCollection.insertOne(visitor);
      }
    }

    console.log('Visitors collection updated successfully');
  } catch (error) {
    console.error('Error updating visitors collection:', error);
  }
}


function generateToken(username, role) {
  const payload = {
    username,
    role
  };
  return jwt.sign(payload, 'asdfghjkl', { expiresIn: 30 * 60 });
}

function verifyToken(req, res, next) {
  let header = req.headers.authorization;
  let token = header.split(' ')[1];

  jwt.verify(token, 'asdfghjkl', function (err, decoded) {
    if (err) {
      res.send("Invalid Token");
    } else {
      req.user = {
        username: decoded.username,
        role: decoded.role
      };
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