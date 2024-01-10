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
 *     parameters:
 *       - name: username
 *         in: query
 *         description: Username
 *         required: true
 *         type: string
 *       - name: password
 *         in: query
 *         description: Password
 *         required: true
 *         type: string
 *         format: password
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
 *                   description: Status of the login operation 
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
 *     summary: Open admin login page
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
 *   /test/register:
 *     post:
 *       summary: Testing purposes (Register a new user )
 *       tags:
 *         - Testing API
 *       parameters:
 *         - name: username
 *           in: query
 *           description: User's username
 *           required: true
 *           type: string
 *         - name: password
 *           in: query
 *           description: User's password
 *           required: true
 *           type: string
 *         - name: Hostname
 *           in: query
 *           description: User's name
 *           required: true
 *           type: string
 *         - name: email
 *           in: query
 *           description: User's email
 *           required: true
 *           type: string
 *         - name: hostNumber
 *           in: query
 *           description: User's phone number
 *           required: true
 *           type: number
 *       responses:
 *         '200':
 *           description: User registration successful.
 *           content:
 *             application/json:
 *               example:
 *                 status: "Registration successful!"
 *         '401':
 *           description: Unauthorized. Only security can register new users.
 *           content:
 *             application/json:
 *               example:
 *                 error: "Unauthorized"
 */

/**
 * @swagger
 * paths:
 *   /host/register:
 *     post:
 *       summary: Register a new user (Security Approval)
 *       tags:
 *         - Security Management
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: username
 *           in: query
 *           description: Host username
 *           required: true
 *           type: string
 *         - name: password
 *           in: query
 *           description: Host password
 *           required: true
 *           type: string
 *         - name: Hostname
 *           in: query
 *           description: Host name
 *           required: true
 *           type: string
 *         - name: email
 *           in: query
 *           description: Host email
 *           required: true
 *           type: string
 *         - name: hostNumber
 *           in: query
 *           description: Host phone number
 *           required: true
 *           type: number
 *       responses:
 *         '200':
 *           description: User registration successful.
 *           content:
 *             application/json:
 *               example:
 *                 status: "Registration successful!"
 *         '401':
 *           description: Unauthorized. Only admin can register new users.
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
 *       summary: Get visitor information ( Authenticated users)
 *       tags:
 *         - User Management
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         '200':
 *           description: Successfully retrieved visitor information.
 *           content:
 *             application/json:
 *               example:
 *                 visitors:
 *                   - visitorname: "John Wick"
 *                     id: "30"
 *                     phoneNumber: "010202067543"
 *                     appointmentDate: "2023-06-21"
 *                     carPlate: "JLB4102"
 *                     Block: "Mawar"
 *                     HouseUnit: "B-9-1"
 *                     Hostname: "chingchong"
 *                     Hostnumber: "0113231231"
 *                     visitorpass: "visitor4567"
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
 *   /addvisitors:
 *     post:
 *       summary: Add a new visitor (Authenticated users)
 *       tags:
 *         - User Management
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: visitorname
 *           in: query
 *           description: Visitor's name
 *           required: true
 *           type: string
 *         - name: id
 *           in: query
 *           description: Visitor's ID
 *           required: true
 *           type: string
 *         - name: phoneNumber
 *           in: query
 *           description: Visitor's phone number
 *           required: true
 *           type: number
 *         - name: appointmentDate
 *           in: query
 *           description: Visitor's appointment date
 *           required: true
 *           type: string
 *           format: date
 *         - name: carPlate
 *           in: query
 *           description: Visitor's car plate
 *           required: true
 *           type: string
 *         - name: Block
 *           in: query
 *           description: Host Block
 *           required: true
 *           type: string
 *         - name: HouseUnit
 *           in: query
 *           description: Host House Unit
 *           required: true
 *           type: string
 *         - name: Hostname
 *           in: query
 *           description: Host name to visit
 *           required: true
 *           type: string
 *         - name: hostNumber
 *           in: query
 *           description : Host number to contact
 *           required: true
 *           type : number
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
 *         '400':
 *           description: Bad Request.
 *           content:
 *             application/json:
 *               example:
 *                 error: "hostNumber must be the same registered number"
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
 *     summary: "Retrieve visitors by name"
 *     description: "Retrieve visitors from the visitors collection by providing name."
 *     tags:
 *         - Visitors Management
 *     parameters:
 *       - in: query
 *         name: visitorname
 *         required: true
 *         description: "The name to filter visitors by."
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Successful response with visitors data."
 *         content:
 *           application/json:
 *             example:
 *               - name: "hahaha"
 *                 visitorpass: ""
 *                 
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
/**
 * @swagger
 * /manage-accounts:
 *   patch:
 *     summary: Update user password (Admin only)
 *     description: Update new contact number of a user account. Only accessible by administrators.
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         description: Username of the user whose contact needs to be updated.
 *         schema:
 *           type: string
 *       - in: query
 *         name: newhostNumber
 *         required: true
 *         description: New contact number for the user account.
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: User password updated successfully.
 *       401:
 *         description: Unauthorized. Only accessible by administrators.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
/**
 * @swagger
 * /get-Number:
 *   get:
 *     summary: Get hostNumber for a visitor.
 *     description: Get the hostNumber for a visitor using their visitorpass.
 *     tags:
 *       - Security Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: visitorpass
 *         required: true
 *         description: The visitorpass of the visitor.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with the hostNumber.
 *         content:
 *           application/json:
 *             example:
 *               hostNumber: '123456'
 *       401:
 *         description: Unauthorized. User does not have the security role.
 *       404:
 *         description: Visitor not found.
 *       500:
 *         description: Internal Server Error.
 */