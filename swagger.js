/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /userlogin:
 *   post:
 *     summary: User login and token generation
 *     tags:
 *       - Authentication
 *     description: Logs in a user and generates an authentication token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Status:
 *                   type: string
 *                   description: Status of the login operation (e.g., "Success")
 *                 usertoken:
 *                   type: string
 *                   description: Authentication token for the user
 *       401:
 *         description: Unauthorized. Invalid credentials for user access.
 */
/**
 * @swagger
 * /Administrator:
 *   get:
 *     summary: Open adminlogin page
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Provide message
 *         content:
 *           text/plain:
 *             example: Copy and navigate to this link https://schoolvisitor3433.azurewebsites.net/adminlogin
 */

 /** 
 * @swagger
 * paths:
 *   /register:
 *     post:
 *       summary: Register a new user 
 *       tags:
 *         - User Management
 *       requestBody:
 *         description: User information for registration
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 password:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       responses:
 *         '200':
 *           description: User registration successful.
 *           content:
 *             application/json:
 *               example:
 *                 status: "Registration successful!"
 *         '401':
 *           description: Unauthorized. Only admin  can register new users.
 *           content:
 *             application/json:
 *               example:
 *                 error: "Unauthorized"
 */



/**
 * @swagger
 * paths:
 *   /visitorinfo:
 *     get:
 *       summary: Get visitor information ( admin access)
 *       tags:
 *         - Admin Management
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         '200':
 *           description: Successfully retrieved visitor information.
 *           content:
 *             application/json:
 *               example:
 *                 visitors:
 *                   - visitorname: "John Placebo"
 *                     id: "871212053345"
 *                     phoneNumber: "010202067543"
 *                     email: "johnplacebo@example.com"
 *                     appointmentDate: "2023-06-21"
 *                     carPlate: "JLB4102"
 *                     purpose: "Majlis Convo"
 *                     destination: "Dewan Seminar"
 *                     registeredBy: "aliffaizat"
 *         '401':
 *           description: Unauthorized. Only admin or security can access
 *           content:
 *             application/json:
 *               example:
 *                 error: "Unauthorized"
 *         '500':
 *           description: Internal Server Error.
 *           content:
 *             application/json:
 *               example:
 *                 error: "Internal Server Error"
 */
/**
 * @swagger
 * paths:
 *   /allusers:
 *     get:
 *       summary: Get information about all users
 *       tags:
 *        - Admin Management
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               example:
 *                 - username: admin
 *                   role: admin
 *                   email: user1@example.com
 *         '401':
 *           description: Unauthorized. Only admin users can access this endpoint.
 *           content:
 *             application/json:
 *               example:
 *                 error: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               example:
 *                 error: Internal Server Error
 */
/**
 * @swagger
 * paths:
 *   /addvisitors:
 *     post:
 *       summary: Add a new visitor 
 *       tags:
 *         - Visitor
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Visitor information for registration
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 visitorname:
 *                   type: string
 *                 id:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 email:
 *                   type: string
 *                 appointmentDate:
 *                   type: string
 *                   format: date
 *                 carPlate:
 *                   type: string
 *                 purpose:
 *                   type: string
 *                 destination:
 *                   type: string
 *                 registeredBy:
 *                   type: string
 *       responses:
 *         '200':
 *           description: Visitor registration successful.
 *           content:
 *             application/json:
 *               example:
 *                 status: "Visitor registration successful!"
 *         '401':
 *           description: Unauthorized. Only users can add visitors.
 *           content:
 *             application/json:
 *               example:
 *                 error: "Unauthorized"
 *         '500':
 *           description: Internal Server Error.
 *           content:
 *             application/json:
 *               example:
 *                 error: "Internal Server Error"
 */
/**
 * @swagger
 * /visitorpass:
 *   get:
 *     summary: "Retrieve visitors by ID"
 *     description: "Retrieve visitors from the visitors collection by providing an ID."
 *     tags:
 *         - User Management
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: "The ID to filter visitors by."
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Successful response with visitors data."
 *         content:
 *           application/json:
 *             example:
 *               - id: "1"
 *                 name: "John Doe"
 *                 # Add other visitor properties here
 *       404:
 *         description: "No visitors found."
 *         content:
 *           text/plain:
 *             example: "No visitors found"
 *       500:
 *         description: "Internal server error."
 *         content:
 *           text/plain:
 *             example: "An error occurred while retrieving visitors by contact"
 */
