
exports.env = {
    mysql:{
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'recipies'
    },
    jwt: {
        accessTokenSecret: 'swsh23hjddnns',
        accessTokenLifeMinutes: 1440, // 1 day
        refreshTokenSecret: "dhw782wujnd99ahmmakhanjkajikhiwn2n",
        refreshTokenLifeMinutes: 10080 // 1 wk
    },
    port: 4042,
    requireAuth: false
}