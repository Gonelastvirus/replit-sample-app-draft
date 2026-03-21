Authentication

| Method | Endpoint             | Body                                |
| ------ | -------------------- | ----------------------------------- |
| POST   | `/api/auth/register` | `{ name, email, password, phone? }` |
| POST   | `/api/auth/login`    | `{ email, password }`               |

Both return `{ user: { id, name, email, phone, role }, token }`. Save the `token` — pass it as `Authorization: Bearer <token>` on protected requests.

------

Properties

| Method | Endpoint                   | Notes                     |
| ------ | -------------------------- | ------------------------- |
| GET    | `/api/properties`          | Returns approved listings |
| GET    | `/api/properties/featured` | Featured listings only    |
| GET    | `/api/properties/:id`      | Single property           |
| POST   | `/api/properties`          | Submit a listing          |
| PUT    | `/api/properties/:id`      | Update a listing          |
| DELETE | `/api/properties/:id`      | Delete a listing          |

**GET `/api/properties` — query params (all optional):**

```
district, listingType (sale|rent), propertyType (house|land|apartment|commercial),
minPrice, maxPrice, bedrooms, limit (default 20), offset (default 0)
```

**POST `/api/properties` — body:**

```
{
  "title": "Modern House in Kathmandu",
  "description": "...",
  "listingType": "sale",
  "propertyType": "house",
  "district": "Kathmandu",
  "priceNpr": 5000000,
  "areaDhur": 4.5,
  "bedrooms": 3,
  "bathrooms": 2,
  "buildYear": 2020,
  "latitude": 27.7172,
  "longitude": 85.3240,
  "amenities": ["parking", "garden"],
  "photos": ["https://..."],
  "videoUrl": "https://...",
  "ownerName": "Ram Sharma",
  "ownerPhone": "+977-9800000000",
  "ownerWhatsapp": "+977-9800000000"
}
```

------

File Upload

| Method | Endpoint      | Notes                                    |
| ------ | ------------- | ---------------------------------------- |
| POST   | `/api/upload` | Multipart form data, field name: `files` |

Returns `{ urls: ["https://.../api/files/filename.jpg"] }`. Use these URLs in the `photos` or `videoUrl` fields when submitting a listing.

------

Construction Services

| Method | Endpoint            | Notes                                               |
| ------ | ------------------- | --------------------------------------------------- |
| GET    | `/api/services`     | Query: `district`, `serviceType`, `limit`, `offset` |
| POST   | `/api/services`     | Add a service listing                               |
| PUT    | `/api/services/:id` | Update                                              |
| DELETE | `/api/services/:id` | Delete                                              |

------

Favorites

| Method | Endpoint                                 | Body / Notes                    |
| ------ | ---------------------------------------- | ------------------------------- |
| GET    | `/api/favorites?userId=<id>`             | Returns user's saved properties |
| POST   | `/api/favorites`                         | `{ userId, propertyId }`        |
| DELETE | `/api/favorites/:propertyId?userId=<id>` | Remove from favorites           |

------

Admin

| Method | Endpoint                            | Notes                                                        |
| ------ | ----------------------------------- | ------------------------------------------------------------ |
| GET    | `/api/admin/properties`             | Query: `status` (pending|approved|rejected), `limit`, `offset` |
| POST   | `/api/admin/properties/:id/approve` | Approve a listing                                            |
| POST   | `/api/admin/properties/:id/reject`  | Body: `{ reason: "..." }`                                    |
| POST   | `/api/admin/properties/:id/feature` | Toggle featured flag                                         |

------

About / Company Info

| Method | Endpoint     | Notes                                                        |
| ------ | ------------ | ------------------------------------------------------------ |
| GET    | `/api/about` | Get company info                                             |
| PUT    | `/api/about` | Update: `{ mission, vision, contactPhone, contactEmail, address, socialLinks }` |

------

Health Check

| Method | Endpoint       |
| ------ | -------------- |
| GET    | `/api/healthz` |

Returns `{ status: "ok" }` — useful to ping Render so the server wakes up before your first real request.