# Instagram Clone

A full-stack Instagram clone built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring real-time updates and modern UI/UX.

## Features

- User Authentication (Sign up, Login, Logout)
- Post Creation and Management
- Like and Comment System
- User Profiles
- Follow/Unfollow System
- Direct Messaging
- Image Upload with AWS S3
- Emoji Support
- Modern UI with Material-UI

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO for real-time features
- AWS S3 for image storage
- Multer for file uploads
- Nodemailer for email notifications

### Frontend
- React.js
- Redux for state management
- Material-UI for components
- Socket.IO Client
- Axios for API calls
- React Router for navigation
- Vite as build tool

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- AWS S3 Bucket
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=your_aws_region
```

## Installation

1. Clone the repository:
```bash
git clone git@gitlab.com:reddykushal7781/instagram_clone.git
cd instagram_clone
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Available Scripts

### Backend
- `npm run dev` - Start the development server
- `npm start` - Start the production server

### Frontend
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 