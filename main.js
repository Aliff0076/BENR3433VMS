const express = require('express')
const app = express()
const port = process.env.PORT || 2000;
const dotenv = require('dotenv'); // Add dotenv for environment variables
dotenv.config(); // Load environment variables from .env file
app.use(express.json())
const jwt = require('jsonwebtoken');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Aliff:BENR3433@cluster2023.kt0fiek.mongodb.net//benr3433?retryWrites=true&w=majority";
const dbName = "benr3433";
const usersCollectionDB = "users";
const visitorsCollectionDB = "visitors";
const { ObjectId } = require('mongodb');


const client = new MongoClient(uri,{
  serverApi:{
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors:true,
  }
});

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
        url: 'http://192.168.0.12:2000', 
        description: 'Visitor Management',
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
    username: "aliff08",
    password: "0987654321",
    name: "aliffaizat",
    email: "alifjr763@gmail.com",
    role  : "user"
  },
  {
    username: "admin",
    password: "password",
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
  // Add more visitors as needed
];

client.connect().then(() => {
  console.log('Connected to MongoDB');

app.post('/login', (req, res) => {
  let data = req.body;
  let user = login(data.username, data.password);

  if (user.role === 'admin') {
    res.send(generateToken(user, 'admin'));
  } else if (user.role === 'user') {
    res.send(generateToken(user, 'user'));
  } else if (user.role === 'security') {
    res.send(generateToken(user, 'security'));
  } else {
    res.send({ error: "User not found" });
  }
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
        data.role
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



app.post('/addvisitors', async (req, res) => {
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
});

app.get('/visitorinfo', verifyToken, async (req, res) => {
  try {
    // Connect to the MongoDB server
    await client.connect();

    if (req.user.role === 'admin' || req.user.role === 'security') {
      const visitorsCursor = client
        .db("benr2423")
        .collection("visitors")
        .find();
      const visitors = await visitorsCursor.toArray();
      res.send(visitors);
    } else if (req.user.role === 'user') {
      const visitorsCursor = client
        .db("benr2423")
        .collection("visitors")
        .find({ registeredBy: req.user.userProfile.name });
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
    await client.close();
  }
});

app.get('/allusers', verifyToken, async (req, res) => {
  try {
    // Connect to the MongoDB server
    await client.connect();

    // Check if the user is an admin
    if (req.user.role === 'admin') {
      const usersCursor = client
        .db("benr2423")
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
    await client.close();
  }
});



function login(loginuser, loginpassword) {
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
        user._id = new ObjectId(); // Generate a new ObjectId
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

function generateToken(userProfile, role) {
  const payload = {
    userProfile,
    role
  };
  return jwt.sign(payload, 'access_token', 
  { expiresIn: 30 * 60 });
}

function verifyToken(req, res, next) {
  let header = req.headers.authorization;
  let token = header.split(' ')[1];

  jwt.verify(token, 'access_token', function (err, decoded) {
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