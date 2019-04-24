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

For requests marked as `🔒`, you need to have the `Authorization` header set with the value built as `Bearer {token}`, where `{token}` is the token received with the login call.

For all POST / PUT requests that have a json body provided, you need to set the `application/json` value for the `Content-Type` header.

For all POST requests that involve uploading images, you need to set the `multipart/form-data` value for the `Content-Type` header.

Tokens have a lifetime of 30 days, after which they will expire and a new token has to be requested through a new login call for that user. The token is reset for a user with each login call.

In the documentation, certain attributes displayed with a colon in the begining (e.g. `:id`) need to be replaced with a corresponding value when you are making the call.

## 1. Accounts `👤`
### 1.1 Register 
**[<code>POST</code> account/register](https://releasetracker.app/foodtruck-api/v1/account/register)**

Request Body Parameters:
- `username` - *String* (required)
- `password` - *String* (required)

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
- Usernames are considered unique on a case insensitive basis (e.g. if `Tommy Vercetti` is registered, trying to register `tommy vercetti` will result in a conflict error)
- Note: spaces are allowed in usernames
### 1.2 Login
**[<code>POST</code> account/login](https://releasetracker.app/foodtruck-api/v1/account/login)**

Request Body Parameters:
- `username` - *String* (required)
- `password` - *String* (required)

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

In case the username or password are not valid, `401 UNAUTHORIZED` response will be returned.
### 1.3 Logout `🔒`
**[<code>POST</code> account/logout](https://releasetracker.app/foodtruck-api/v1/account/logout)**

Example Response Body **`200 OK`**:
```json
{
	"message": "Logged out successfully"
}
```
### 1.4 Me `🔒`
**[<code>GET</code> account/me](https://releasetracker.app/foodtruck-api/v1/account/me)**

Example Response Body **`200 OK`**:
```json
{
	"_id": "5cbf71bea8d0d843a08979f8",
	"username": "Tommy Vercetti",
	"joined": "2019-04-23T20:12:46.586Z"
}
```
### 1.5 Get account by id
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

### 1.6 Username availability
**[<code>GET</code> account/availability/:username](https://releasetracker.app/foodtruck-api/v1/account/availability/Tommy%20Vercetti)**

Request URL parameters:
- `username` - Account username

Response codes: 
- **`200 OK`** - Username is available for registration
- **`409 CONFLICT`** - Username is unavailable for registration

### 1.7 Upload profile image `🔒`
**[<code>POST</code> account/image](https://releasetracker.app/foodtruck-api/v1/account/image)**

Request Body Parameters:
- `image` - *File* (required) - Image file

Specific restrictions:
- Max file size is 10MB
- Accepted MIME types: `image/jpeg`, `image/png`

**Accessing profile images**

In your client app, you need to build the image url as follows:
- Full size version: `https://releasetracker.app/profile_images/:image`
- Thumbnail (max res: 150x150): `https://releasetracker.app/profile_images/thumbnails/:image`

...where `:image` is the `image` field from sections 2.2 / 2.3

### 1.8 Delete profile image `🔒`
**[<code>DELETE</code> account/image](https://releasetracker.app/foodtruck-api/v1/account/image)**

## 2. Foodtrucks `🚚`
### 2.1 Add foodtruck `🔒`
**[<code>POST</code> foodtrucks/add](https://releasetracker.app/foodtruck-api/v1/foodtrucks/add)**

Request Body Parameters:
- `name` - *String* (required)
- `foodtype` - *String* (required)
- `coordinates` - *Object* (required)
	- `lat` - *Number* (required)
	- `long` - *Number* (required)

Example Request Body:
```json
{
	"name": "Cherry Popper",
	"foodtype": "Ice Cream",
	"coordinates": {
		"lat": 25.789603494529825,
		"long": -80.18718123435976
	}
}
```
Example Response Body **`201 CREATED`**:
```json
{
	"message": "Foodtruck saved successfully"
}
```

Specific restrictions:
- `name` max length: 100 characters
- `foodtype` max length: 100 characters

### 2.2 Get all foodtrucks
**[<code>GET</code> foodtrucks/get](https://releasetracker.app/foodtruck-api/v1/foodtrucks/get)**

Example Response Body **`200 OK`**:
``` json
[
    {
        "_id": "5cbf6cfea8d0d843a08979f7",
        "name": "Cherry Popper",
        "foodtype": "Ice Cream",
        "coordinates": {
            "lat": 25.789603494529825,
            "long": -80.18718123435976
        },
        "image": "foodtruck-image-5cbf6cfea8d0d843a08979f7.jpg",
        "owner": {
            "_id": "5cbf6c56a8d0d843a08979f5",
            "username": "Tommy Vercetti",
            "joined": "2019-04-23T19:49:42.375Z"
        },
        "created": "2019-04-23T19:52:30.072Z",
        "lastUpdate": "2019-04-23T19:52:30.072Z",
        "avgRating": 5,
        "ratingCount": 1
    }
]
```

### 2.3 Get foodtruck by id
**[<code>GET</code> foodtrucks/get/:id](https://releasetracker.app/foodtruck-api/v1/foodtrucks/get/5cbf6cfea8d0d843a08979f7)**

Request URL Parameters:
- `id` (required) - Foodtruck id

Example Response Body **`200 OK`**:
```json
{
    "_id": "5cbf6cfea8d0d843a08979f7",
    "name": "Cherry Popper",
    "foodtype": "Ice Cream",
    "coordinates": {
        "lat": 25.789603494529825,
        "long": -80.18718123435976
    },
    "image": "foodtruck-image-5cbf6cfea8d0d843a08979f7.jpg",
    "owner": {
        "_id": "5cbf6c56a8d0d843a08979f5",
        "username": "TestUser",
        "joined": "2019-04-23T19:49:42.375Z"
    },
    "created": "2019-04-23T19:52:30.072Z",
    "lastUpdate": "2019-04-23T19:52:30.072Z",
    "avgRating": 5,
    "ratingCount": 1
}
```

### 2.4 Update foodtruck `🔒`
**[<code>PUT</code> foodtrucks/update/:id](https://releasetracker.app/foodtruck-api/v1/foodtrucks/update/5cbf6cfea8d0d843a08979f7)**

Request URL Parameters:
- `id` (required) - Foodtruck id

Request Body Parameters:
- `name` - *String* (required)
- `foodtype` - *String* (required)
- `coordinates` - *Object* (required)
	- `lat` - *Number* (required)
	- `long` - *Number* (required)

Example Request Body:
```json
{
	"name": "Cherry Popper",
	"foodtype": "Vanilla Ice Cream",
	"coordinates": {
            "lat": 25.789603494529825,
            "long": -80.18718123435976
        }
}
```

Example Response Body **`200 OK`**:
```json
{
    "message": "Foodtruck info updated"
}
```

Example Response Body **`403 FORBIDDEN`**:
```json
{
    "message": "You must be the owner of this foodtruck in order to edit its details"
}
```

Specific restrictions:
- Restrictions from section 2.1 apply
- You must be authenticated as the owner of the foodtruck in order to edit it. Otherwise, `403 FORBIDDEN` will be returned.

### 2.5 Delete foodtruck `🔒`
**[<code>DELETE</code> foodtrucks/delete/:id](https://releasetracker.app/foodtruck-api/v1/foodtrucks/delete/5cbf6cfea8d0d843a08979f7)**

Request URL Parameters:
- `id` (required) - Foodtruck id

Example Response Body **`200 OK`**:
```json
{
    "message": "Foodtruck successfully removed"
}
```

Specific restrictions:
- You must be authenticated as the owner of the foodtruck in order to remove it. Otherwise, `403 FORBIDDEN` will be returned.

### 2.6 Upload foodtruck image `🔒`
**[<code>POST</code> foodtrucks/image/:id](https://releasetracker.app/foodtruck-api/v1/foodtrucks/image/5cbf6cfea8d0d843a08979f7)**

Request Body Parameters:
- `image` - *File* (required) - Image file

Specific restrictions:
- Max file size is 10MB
- Accepted MIME types: `image/jpeg`, `image/png`
- You must be authenticated as the owner of the foodtruck in order to upload an image for it. Otherwise, `403 FORBIDDEN` will be returned.

**Accessing foodtruck images**

In your client app, you need to build the image url as follows:
- Full size version: `https://releasetracker.app/foodtruck_images/:image`
- Thumbnail (max res: 150x150): `https://releasetracker.app/foodtruck_images/thumbnails/:image`

...where `:image` is the `image` field from sections 2.2 / 2.3

### 2.7 Delete foodtruck image `🔒`
**[<code>DELETE</code> foodtrucks/image/:id](https://releasetracker.app/foodtruck-api/v1/foodtrucks/image/5cbf6cfea8d0d843a08979f7)**

Specific restrictions:
- You must be authenticated as the owner of the foodtruck in order to remove its image. Otherwise, `403 FORBIDDEN` will be returned.

## 3. Reviews `📝`
### 3.1 Add review `🔒`
**[<code>POST</code> foodtrucks/reviews/add/:foodtruck_id](https://releasetracker.app/foodtruck-api/v1/foodtrucks/reviews/add/5cbf6cfea8d0d843a08979f7)**

Request URL Parameters:
- `foodtruck_id` (required) - Foodtruck id

Request Body Parameters:
- `title` - *String* (required)
- `text` - *String* (optional)
- `rating` - *Number* (required)

Example Request Body:
```json
{
	"title": "Best ice cream in town",
	"text": "Even the VCPD wants to get some :D",
	"rating": 5
}
```

Example Response Body **`201 CREATED`**:
```json
{
    "message": "Review added successfully"
}
```

Example Response Body **`403 FORBIDDEN`**
```json
{
    "message": "You already have a review submitted, please edit or remove it instead"
}
```

Specific restrictions:
- `title` max length: 100 characters
- `text` max length: 1000 characters
- `rating` *Number* in the 1-5 range
- You can't add a review for your own foodtrucks, otherwise `403 FORBIDDEN` will be returned
- You can't add more than one review per foodtruck, otherwise `403 FORBIDDEN` will be returned

### 3.2 Get all reviews for foodtruck id
**[<code>GET</code> foodtrucks/reviews/get/:foodtruck_id](https://releasetracker.app/foodtruck-api/v1/foodtrucks/reviews/get/5cbf6cfea8d0d843a08979f7)**

Request URL Parameters:
- `foodtruck_id` (required) - Foodtruck id

Example Response Body **`200 OK`**:
```json
[
    {
        "_id": "5cc03f80f6805c03c8996e31",
        "created": "2019-04-24T10:50:40.920Z",
        "lastUpdate": "2019-04-24T10:50:40.920Z",
        "title": "Best ice cream in town",
        "text": "Even the VCPD wants to get some :D",
        "rating": 5,
        "foodtruck": "5cbf6cfea8d0d843a08979f7",
        "author": {
            "_id": "5cbf71bea8d0d843a08979f9",
            "username": "Lance Vance",
            "joined": "2019-04-23T20:12:46.586Z"
        }
    }
]
```


### 3.3 Update review `🔒`
**[<code>PUT</code> foodtrucks/reviews/update/:id](https://releasetracker.app/foodtruck-api/v1/foodtrucks/reviews/update/5cc03f80f6805c03c8996e31)**

Request URL Parameters:
- `id` (required) - Review id

Request Body Parameters:
- `title` - *String* (required)
- `text` - *String* (optional)
- `rating` - *Number* (required)

Example Request Body:
```json
{
	"title": "Oh, well",
	"text": "It's not as good as it's hyped up to be. I think the owner is hiding something shady.",
	"rating": 2
}
```

Example Response Body **`200 OK`**:
```json
{
    "message": "Review updated"
}
```

Specific restrictions:
- Parameter restrictions from section 3.1 apply
- You must be authenticated as the author of the review in order to edit it. Otherwise, `403 FORBIDDEN` will be returned.

### 3.4 Delete Review `🔒`
**[<code>DELETE</code> foodtrucks/reviews/delete/:id](https://releasetracker.app/foodtruck-api/v1/foodtrucks/reviews/delete/5cc03f80f6805c03c8996e31)**


Request URL Parameters:
- `id` (required) - Review id

Specfic restrictions:
- You must be authenticated as the author of the review in order to remove it. Otherwise, `403 FORBIDDEN` will be returned.
