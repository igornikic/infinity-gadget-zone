<h1 align="center">Infinity Gadget Zone </h1>

<br>

# Features ⭐⭐⭐

For list of all features see [Wiki](https://github.com/igornikic/infinity-gadget-zone/wiki).

<br>

# Project Overview

## What your application does?

It's a multi-store e-commerce platform whose main purpose is to connect customers with sellers.

## What was your motivation?

> The main aim is to understand the process of developing a MERN Application through practical experience.
> I believe that the most efficient way of learning is through putting acquired knowledge into practice in real life situations.
> My objective in this project is to know more about every step involved in application development.
> Thus, not only can this project offer me an opportunity to gain deeper insights into MERN technologies but also lay a solid foundation for future career growth in web design industry.

## Why did you build this project?

> To demonstrate my ability to merge technology with practical projects. Creating a new project from the scratch is a challenge that gives me satisfaction. Making this project will help make my resume differentiate itself among others. It shows initiative, determination and the practical application of technology in real-life situations. Finally, there is also the hope that one day I can build something truly useful and impactful.

## What problem does it solve?

> Well, first and foremost, I really hope that it will help me out of my little unemployment situation.😂
> However, on a more serious note, it also gives me confidence in technology world and offers a pretty good addition to my empty CV.
> This project itself is somewhat like an online market place. Platform where sellers can display their wares to customers and get feedback from them as well. It’s about linking up buyers to sellers and making it easy for people find what they want…

## What did you learn?

> Okay, let's summarize it! I have improved my skill of building a MERN stack app alone from the beginning and to some extent optimized it. Plus, I learned how to test it in multiple different ways so that it is secured and performs as expected.
> But you know what? The biggest lesson? Nothing is impossible to achieve and the only things needed are passion, strong will, time and one old laptop.😄

## What makes your project stand out?

> Complexity of the app and it's features.

<br>

## Getting Started ▶️▶️▶️

1. Clone the repository: `git clone https://github.com/igornikic/infinity-gadget-zone.git`
2. Navigate to the backend directory of the project `cd backend`
3. Install backend dependencies: `npm install`
4. Start the backend server: `npm run dev` (This will start the backend server on port 4000 in development mode)
5. Open a new terminal window and navigate to the frontend directory: `cd frontend`
6. Install frontend dependencies: `npm install`
7. Start the frontend server: `npm run dev` (This will start the frontend server with Vite on port 5173 in development mode)
8. Open a web browser and navigate to `http://localhost:5173` to access the app.

- Note: If you encounter any issues, make sure that you have Node.js and npm installed on your machine, and that you have the correct versions of the required dependencies installed.

<br>

## Environment Variables 🌍🌍🌍

<br>

This project uses a .env file to define environment variables for the application. The .env file should be created at the root of the project directory with the following variables defined:

<br>

backend/config/config.env

```
PORT = 4000
NODE_ENV = DEVELOPMENT
FRONTEND_URL = http://127.0.0.1:5173
DB_LOCAL_URI = <YOUR_LOCAL_MONGODB_URI>
DB_URI = <YOUR_MONGODB_ATLAS_URI>
DB_URI_FORMAT_FOR_GITHUB_ACTIONS = <YOUR_MONGODB_ATLAS_URI>?retryWrites=true&w=majority

USER_JWT_SECRET = <YOUR_JWT_SECRET>
SHOP_JWT_SECRET = <YOUR_JWT_SECRET>
JWT_EXPIRES_TIME = 7d
COOKIE_EXPIRES_TIME = 7

STRIPE_API_KEY = <YOUR_STRIPE_API_KEY>
STRIPE_SECRET_KEY = <YOUR_STRIPE_SECRET_KEY>

CLOUDINARY_CLOUD_NAME = dsqjoidmi
CLOUDINARY_API_KEY = 652697712664698
CLOUDINARY_API_SECRET = xuXkO-_sbHkI4ElU7RRiqSsS-XA

SMTP_EMAIL = <YOUR_EMAIL>
SMTP_FROM_EMAIL = <YOUR_EMAIL>
SMTP_PASSWORD = <YOUR_PASSWORD>
SMTP_FROM_NAME = <APP_NAME>

GOOGLE_OAUTH_CLIENT_ID = <YOUR_OAUTH_ID>
GOOGLE_OAUTH_CLIENT_SECRET = <YOUR_SECRET>
GOOGLE_OAUTH_REDIRECT = http://localhost:5173/api/sessions/oauth/google

USER_TEST_EMAIL = <YOUR_EMAIL>
SELLER_TEST_EMAIL = <YOUR_EMAIL>
ADMIN_TEST_EMAIL = <YOUR_EMAIL>
```

- Note: You need to set up cloudinary account, stripe account and Google OAuth 2.0. Create MongoDB Atlas cluster. Enable 2 step verification on your email from which you are sending emails from the app.

<br>

frontend/.env

```
VITE_ENCRYPTION_KEY = <YOUR_ENCRYPTION_KEY>
VITE_ENV = development
VITE_GOOGLE_OAUTH_CLIENT_ID = <YOUR_OAUTH_ID>
```

<br>

## App Preview 📷 (some parts of app)

// Todo

<br>

## License ⚖️

This project is licensed under the MIT License. See the `LICENSE` file for details.
