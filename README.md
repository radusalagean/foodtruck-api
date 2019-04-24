# foodtruck-api
Node.js API based on the one presented in https://www.udemy.com/api-development.

Building on that base, the following features have been added:
- Image support for foodtrucks and user accounts
- Auto generation of thumbnails
- Better error handling
- Rating support for reviews
- Queries for foodtrucks return average rating and rating count, based on the associated reviews
- Ownership for submitted foodtruck and review entities (Only the original authors can edit or remove them)
- Other improvements

## Usage
Base URL: `https://releasetracker.app/foodtruck-api/v1/`

Requests marked as `🔒 Authenticated`, you need to have the `Authorization` header set with the value built as `Bearer {token}`, where `{token}` is the token received with the login call.

For all POST / PUT requests that have a json body provided, you need to set the `application/json` value for the `Content-Type` header.

For all POST requests that involve uploading images, you need to set the `multipart/form-data` value for the `Content-Type` header.

Tokens have a lifetime of 30 days, after which they will expire and a new token has to be requested through a new login call for that user. The token is reset for a user with each login call.

In the documentation, certain attributes with a colon in the begining (ex. `:id`), need to be replaced with a value when you are making the call.

### 1. Accounts 👤
#### 1.1 Register 
**[<code>POST</code> account/register](https://releasetracker.app/foodtruck-api/v1/account/register)**

Request Body Parameters:
- `username` (required)
- `password` (required)

Example Request Body:
```json
{
	"username": "Tommy Vercetti",
	"password": "let's go"
}
```
Example Response Body **`201 CREATED`**:
```json
{
	"message": "New account created successfully"
}
```
Specific restrictions:
- Usernames must be unique (otherwise, `409 CONFLICT` will be returned)
- Usernames are considered unique on a case insensitive basis (ex. if `Tommy Vercetti` is registered, trying to register `tommy vercetti` will result in a conflict error)
- Note: spaces are allowed in usernames
#### 1.2 Login
**[<code>POST</code> account/login](https://releasetracker.app/foodtruck-api/v1/account/login)**

Request Body Parameters:
- `username` (required)
- `password` (required)

Example Request Body:
```json
{
	"username": "Tommy Vercetti",
	"password": "let's go"
}
```
Example Response Body **`200 OK`**:
```json
{
	"user": "Tommy Vercetti",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjYmY3MWJlYThkMGQ4NDNhMDg5NzlmOCIsImlhdCI6MTU1NjA1MDY5NiwiZXhwIjoxNTU4NjQyNjk2fQ.5DzDWCOT0ufiI4Yam05_RNwg-pBQCM7BnApi1A9ws7E"
}
```
**In case the username or password are not valid, `401 FORBIDDEN` response will be returned**
#### 1.3 Logout `🔒 Authenticated`
**[<code>POST</code> account/logout](https://releasetracker.app/foodtruck-api/v1/account/logout)**

Example Response Body **`200 OK`**:
```json
{
	"message": "Logged out successfully"
}
```
#### 1.4 Me `🔒 Authenticated`
**[<code>GET</code> account/me](https://releasetracker.app/foodtruck-api/v1/account/me)**

Example Response Body **`200 OK`**:
```json
{
	"_id": "5cbf71bea8d0d843a08979f8",
	"username": "Tommy Vercetti",
	"joined": "2019-04-23T20:12:46.586Z"
}
```
#### 1.5 Get account by id
**[<code>GET</code> account/get/:id](https://releasetracker.app/foodtruck-api/v1/account/get/5cbf71bea8d0d843a08979f8)**

Request URL parameters:
- `id` (required) - Account id

Example Response Body **`200 OK`**:
```json
{
	"_id": "5cbf71bea8d0d843a08979f8",
	"username": "Tommy Vercetti",
	"joined": "2019-04-23T20:12:46.586Z"
}
```

#### 1.6 Username availability
**[<code>GET</code> account/availability/:username](https://releasetracker.app/foodtruck-api/v1/account/availability/Tommy%20Vercetti)**

Request URL parameters:
- `username` (required) - Account username

Response codes: 
- **`200 OK`** - Username is available for registration
- **`409 CONFLICT`** - Username is unavailable for registration

#### 1.7 Upload profile image `🔒 Authenticated`
**[<code>POST</code> account/image](https://releasetracker.app/foodtruck-api/v1/account/image)**

Request Body Parameters:
- `image` (required) - Image file

Specific restrictions:
- Max file size is 10MB
- Accepted MIME types: `image/jpeg`, `image/png`

#### 1.8 Remove profile image `🔒 Authenticated`
**[<code>DELETE</code> account/image](https://releasetracker.app/foodtruck-api/v1/account/image)**
