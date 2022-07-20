const {UnauthorizedError, BadRequestError} = require("../utils/errors")
const db = require("../db")
const {BCRYPT_WORK_FACTOR} = require("../config")
const bcrypt = require("bcrypt")

class User {
    static async makePublicUser(user) {
        return {
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email, 
            location: user.location, 
            date: user.date
        }
    }
    static async login(credentials) {
        // user should submit their email and password
        // if any of these fields are missing, throw an error
        const requiredFields = ["email", "password"]
        requiredFields.forEach((field) => {
            if (!credentials.hasOwnProperty(field)) {
                throw new BadRequestError(`Missing ${field} in request body.`)
            }
        })
        // lookup the user in the db by email
        const user = await User.fetchUserByEmail(credentials.email)        
        // if a user is found, compare the submitted password
        // with the password in the db
        // if there is a match, return the user
        if (user) {
            const isValid = await bcrypt.compare(credentials.password, user.password)
            if (isValid) {
                return User.makePublicUser(user)
            }
        }
        // if any of this goes wrong, throw and error
        throw new UnauthorizedError("Invalid email/password combo")
    }

    static async register(credentials) {
        // user should submit their info (e.g. name, email and password) 
        // if any of these fields are missing, throw an error
        const requiredFields = ["password", "firstName", "lastName",
            "email", "location", "date"]
        requiredFields.forEach((field) => {
            if (!credentials.hasOwnProperty(field)) {
                throw new BadRequestError(`Missing ${field} in request body.`)
            }
        })
        if (credentials.email.indexOf("@") <= 0) {
            throw new BadRequestError("Invalid email.")
        }
        // make sure no user already exists in the system with that email
        // if one does, throw an error
        const existingUser = await User.fetchUserByEmail(credentials.email)
        if(existingUser) {
            throw new BadRequestError(`Duplicate email: ${credentials.email}`)
        }
        // take the user's password and hash it
        const hashedPassword = await bcrypt.hash(credentials.password, BCRYPT_WORK_FACTOR)
        // take the user's email and lowercase it
        const lowercaseEmail = credentials.email.toLowerCase()
        // create a new user in the db with all their info
        const result = await db.query(
            `
            INSERT INTO users (
                password,
                first_name,
                last_name,
                email,
                location,
                date
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, first_name, last_name, email, location, date
            `,
            [hashedPassword, credentials.firstName, credentials.lastName, lowercaseEmail, 
            credentials.location, credentials.date || (new Date()).toISOString()]
        )    
        // return the user 
        const user = result.rows[0]
        return User.makePublicUser(user)   
    }
    static async fetchUserByEmail(email) {
        if (!email) {
            throw new BadRequestError("No email provided")            
        }
        const query = `SELECT * FROM users WHERE email = $1`
        const result = await db.query(query, [email.toLowerCase()])
        const user = result.rows[0]
        return user
    }
}

module.exports = User