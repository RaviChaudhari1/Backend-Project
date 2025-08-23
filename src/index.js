// require('dotenv').config({path: './env'})
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './db/index.js';
import app from './app.js';
dotenv.config({
    path: "./.env"
})

connectDB()
  .then(() => {
    const server = app.listen(process.env.PORT, () => {
      console.log(`\n ⚙️  Server is running on port ${process.env.PORT}`);
    });
    server.on('error', (error) => {
      console.error("❌Server Error:", error);
      throw error;
    });
  })
.catch((error) => {
    console.error("❌Failed to start the server:", error);
    process.exit(1);
})
;