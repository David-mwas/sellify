<div align="center">
<img src="selify/assets/images/selify.png" width="250"/>

# Selify - Sell items you no longer need

Selify is a platform designed to help users declutter their lives by selling unused items and items they don't need anymore. 
</div>

<div align="center">
<img src="https://res.cloudinary.com/dlio7cpjo/image/upload/v1733928269/selifyapp/yuhcmsqjut7uz1aqdhgn.jpg" width="250"/>
<img src="https://res.cloudinary.com/dlio7cpjo/image/upload/v1733928269/selifyapp/kmjfgo3z5q2xifjodc7j.jpg" width="250"/>
<img src="https://res.cloudinary.com/dlio7cpjo/image/upload/v1733928269/selifyapp/mpn7yipkc0rmfj3ei0rf.jpg" width="250"/>

<img src="https://res.cloudinary.com/dlio7cpjo/image/upload/v1733928269/selifyapp/wxntgwwtbtuujcvxu99r.jpg" width="250"/>
<img src="https://res.cloudinary.com/dlio7cpjo/image/upload/v1733928269/selifyapp/h9v6uy8srow2dvzvgyyj.jpg" width="250"/>
<img src="https://res.cloudinary.com/dlio7cpjo/image/upload/v1733928269/selifyapp/xp8i8hu9bxvl6srxsnpg.jpg" width="250"/>

<img src="https://res.cloudinary.com/dlio7cpjo/image/upload/v1733928269/selifyapp/tkpojor09mxtppltaopo.jpg" width="250"/>
<img src="https://res.cloudinary.com/dlio7cpjo/image/upload/v1733928269/selifyapp/qwcssemuprhb6e0cwimv.jpg" width="250"/>
<img src="https://res.cloudinary.com/dlio7cpjo/image/upload/v1733928269/selifyapp/us8abef0fjgor0rxk2ip.jpg" width="250"/>
</div>

## Features

- **User Authentication**: Users can sign up, log in, and manage their accounts.
- **Product Listings**: Users can create, update, and delete product listings with images and descriptions.
- **Categories**: Browse and filter products by categories.
- **Messaging**: Send and receive messages between users for negotiations or inquiries in Realtime
- **Push Notifications**: Receive real-time notifications about new messages, product updates, and more.

## Tech Stack

- **Frontend**: Expo (React Native) - Cross-platform mobile app development.
- **Backend**: Node.js, Express - Robust backend API handling user authentication, product listings, and messaging.
- **Database**: MongoDB - NoSQL database for storing user profiles, products, and messages.
- **Authentication**: JWT (JSON Web Tokens) - Secure user authentication.
- **File Uploads**: Cloudinary - Image storage for product listings.
- **Real-time Communication**: Socket.IO - For chat and message notifications.
- **Push Notifications**: Expo Push Notifications - For real-time alerts to users.

## Architecture

The Selify app is structured around the following key components:

- **Frontend (Mobile App)**: Developed with Expo and React Native, allowing users to interact with the marketplace. The mobile app supports cross-platform development, making it available on both iOS and Android.

  - **Screens**: The app includes various screens like the login screen, product listing, user profile, and messaging.
  - **Navigation**: The app uses React Navigation to handle navigation between different screens, such as product pages and user profile.

- **Backend (API)**: The backend is built with Node.js and Express and MongoDB, handling requests related to authentication, product listings, messaging, and more.

  - **RESTful API**: The backend exposes a set of API endpoints for managing products, users, and messages.
  - **Database**: MongoDB is used to store user data, product information, and messages.
  - **Authentication**: JWT tokens are used to securely authenticate users and manage session states.

- **Real-time Communication**: Socket.IO is used for real-time messaging, enabling users to send and receive messages instantly.

- **Cloud Storage**: Cloudinary is integrated for file uploads, allowing users to upload images of products for their listings.

## App Flow

1. **User Authentication**: New users can register with their email and password, while returning users can log in. JWT tokens are used to authenticate users.
2. **Product Listings**: Once logged in, users can browse products listed by others, filter them by category, and create their own listings with images and descriptions.
3. **Messaging**: Users can send and receive messages directly within the app to discuss the products, negotiate prices, or ask for more details.
4. **Push Notifications**: Users receive notifications about new messages, product updates, and other relevant events.

## Installation

To run the Selify app locally:

### 1. Clone the repository

```bash
git clone https://github.com/David-mwas/selify.git
```
