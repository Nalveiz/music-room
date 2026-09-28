import { Router } from "express";
import { changePassword, createUser, getUsers, verifyEmail, savePassword, googleCallback, getInfos, login, sendFriendRequest, acceptFriendsRequest, updateProfile, showResetPasswordPage, updateProfileVisibility } from "../controllers/UserController";
import passport from "../services/GoogleService";
import "../services/FacebookService";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @openapi
 * paths:
 *  /users:
 *    post:
 *      summary: Adds a new user
 *      requestBody:
 *        content:
 *          application/json:
 *            schema: # Request body contents
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                surname:
 *                  type: string
 *                username:
 *                  type: string
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *                birth_date:
 *                  type: date
 *              example: # Sample object
 *                name: Esra
 *                surname: Ablak
 *                username: eablak
 *                email: esrablk9@gmail.com
 *                password: pass1234
 *                birth_date: 1999-12-30
 *      responses:
 *        "200":
 *          description: OK
 */
router.post("/users", createUser);


/**
 * @openapi
 * paths:
 *   /verify:
 *     get:
 *       summary: Verify user email
 *       parameters:
 *         - in: query
 *           name: token
 *           required: true
 *           description: Token that you will get in your email box.
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Email verified successfully.
 *         400:
 *           description: Email verification failed.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     examples:
 *                       missing:
 *                         value: Token is required.
 *                       invalid:
 *                         value: Invalid token.
 *                       expired:
 *                         value: Token has expired.
 */
router.get("/verify", verifyEmail);


/**
 * @openapi
 * paths:
 *   /users/reset-password:
 *     post:
 *       summary: Request a password reset email
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *               example:
 *                 email: esrablk9@gmail.com
 *       responses:
 *         "200":
 *           description: Reset email sent successfully.
 *         "400":
 *           description: Invalid email address.
 *         "500":
 *           description: Reset password failed.
 */
router.post("/users/reset-password", changePassword);



/**
 * @openapi
 * paths:
 *   /reset:
 *     post:
 *       summary: Save new password using reset token
 *       parameters:
 *         - in: query
 *           name: token
 *           required: true
 *           description: Token received in the password reset email.
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 new_password:
 *                   type: string
 *               example:
 *                 new_password: newPass1234
 *       responses:
 *         "200":
 *           description: Password successfully changed.
 *         "400":
 *           description: Password reset failed.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     examples:
 *                       missing:
 *                         value: Token and new password are required.
 *                       invalid:
 *                         value: Invalid token.
 *                       expired:
 *                         value: Token has expired.
 */
router.post("/reset", savePassword);
router.get("/reset-password", showResetPasswordPage);


/**
 * @openapi
 * /auth/google:
 *   get:
 *     summary: Start Google authentication
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirects the user to Google for authentication
 */
router.get("/auth/google", passport.authenticate("google", { session: false, scope: ["email", "profile"], }));


/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     summary: Google authentication callback
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Google authentication successful
 *       401:
 *         description: Google login failed
 */
router.get("/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/auth/google/failed"}), googleCallback);


/**
 * @swagger
 * /auth/google/failed:
 *   get:
 *     summary: Google authentication failed
 *     tags:
 *       - Authentication
 *     responses:
 *       401:
 *         description: Google login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Google login failed
 */
router.get("/auth/google/failed", (req, res) => { res.status(401).json({message: "Google login failed"}); });


/**
 * @openapi
 * /auth/facebook:
 *   get:
 *     summary: Start Facebook authentication
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirects the user to Facebook for authentication
 */
router.get("/auth/facebook", passport.authenticate("facebook", { session: false, scope: ["email", "public_profile"], }));


/**
 * @openapi
 * /auth/facebook/callback:
 *   get:
 *     summary: Facebook authentication callback
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Facebook authentication successful
 *       401:
 *         description: Facebook login failed
 */
router.get("/auth/facebook/callback", passport.authenticate("facebook", { session: false, failureRedirect: "/auth/facebook/failed"}), googleCallback);


/**
 * @swagger
 * /auth/facebook/failed:
 *   get:
 *     summary: Facebook authentication failed
 *     tags:
 *       - Authentication
 *     responses:
 *       401:
 *         description: Facebook login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Facebook login failed
 */
router.get("/auth/facebook/failed", (req, res) => { res.status(401).json({message: "Facebook login failed"}); });


/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/users/:id", authMiddleware ,getInfos);


/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               username:
 *                 type: string
 *               profile_photo:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: No valid fields to update
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.patch("/users/:id", authMiddleware, updateProfile);


/**
 * @openapi
 * paths:
 *   /users/me/visibility:
 *     patch:
 *       summary: Updates the visibility settings of the authenticated user's profile information
 *       tags:
 *         - Users
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name_visibility:
 *                   type: string
 *                   enum:
 *                     - public
 *                     - friends
 *                     - private
 *                 surname_visibility:
 *                   type: string
 *                   enum:
 *                     - public
 *                     - friends
 *                     - private
 *                 username_visibility:
 *                   type: string
 *                   enum:
 *                     - public
 *                     - friends
 *                     - private
 *                 created_date_visibility:
 *                   type: string
 *                   enum:
 *                     - public
 *                     - friends
 *                     - private
 *                 profile_photo_visibility:
 *                   type: string
 *                   enum:
 *                     - public
 *                     - friends
 *                     - private
 *                 birth_date_visibility:
 *                   type: string
 *                   enum:
 *                     - public
 *                     - friends
 *                     - private
 *                 email_visibility:
 *                   type: string
 *                   enum:
 *                     - public
 *                     - friends
 *                     - private
 *       responses:
 *         200:
 *           description: Profile visibility updated successfully
 *         400:
 *           description: No valid visibility fields or invalid visibility value
 *         401:
 *           description: Unauthorized
 *         404:
 *           description: User not found
 */
router.patch("/users/me/visibility", authMiddleware, updateProfileVisibility);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid credentials
 */
router.post("/auth/login", login);


/**
 * @swagger
 * /friends/{id}:
 *   post:
 *     summary: Send a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to send the request to
 *     responses:
 *       201:
 *         description: Friend request sent
 *       409:
 *         description: Users are already friends
 *       401:
 *         description: Unauthorized
 */
router.post("/friends/:id", authMiddleware, sendFriendRequest);


/**
 * @swagger
 * /friends/{id}/accept:
 *   post:
 *     summary: Accept a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the request sender
 *     responses:
 *       200:
 *         description: Friendship request accepted
 *       404:
 *         description: No pending request
 *       401:
 *         description: Unauthorized
 */
router.post("/friends/:id/accept", authMiddleware, acceptFriendsRequest)


/**
 * @openapi
 * paths:
 *  /users:
 *    get:
 *      summary: Get all users
 *      responses:
 *        200:
 *          description: Numeric ID of the user to get
 */
router.get("/users", getUsers);



export default router;