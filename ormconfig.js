module.exports = {
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "postgres",
  "password": "asdf1234",
  "database": "scrapdata-test",
  "synchronize": true,
  "dropSchema": false,
  "logging": "all",
  "entities": [
    "entity/**/*.ts"
  ],
  "migrations": [
    "migrations/**/*.ts"
  ],
  "subscribers": [
    "src/subscriber/**/*.ts"
  ]
}