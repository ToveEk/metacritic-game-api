import jwt from 'jsonwebtoken';

/**
 * Class responsible for generating JSON Web Tokens (JWTs) for user authentication and authorization.
 */
export class JsonWebToken {

    /**
     * Generates a JSON Web Token (JWT) for the given user.
     * 
     * @param {object} user - The user object containing user details.
     * @param {string} privateKey - The private key used to sign the JWT.
     * @param {string} expiresIn - The expiration time for the JWT.
     * @returns {Promise<string>} A promise that resolves to the generated JWT.
     * @throws {Error} If there is an error during token generation.
     */
    static async generateJWT(user, privateKey, expiresIn) {
        const payload = {
            sub: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            username: user.username
        }

        return new Promise((resolve, reject) => {
            jwt.sign(
                payload,
                privateKey,
                {
                    algorithm: 'RS256',
                    expiresIn: expiresIn
                },
                (err, token) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(token);
                    }
                }

            )
        })
    }
}