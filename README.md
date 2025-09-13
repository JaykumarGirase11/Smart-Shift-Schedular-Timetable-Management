# Smart Shift Scheduler

A comprehensive application for managing employee shift schedules, leave requests, and week offs efficiently.

![Smart Shift Scheduler](https://via.placeholder.com/800x400?text=Smart+Shift+Scheduler)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Documentation](#documentation)
- [Contributing](#contributing)

## Overview

Smart Shift Scheduler is a full-featured application designed to simplify the management of employee shifts, particularly for teams working in multiple time zones like IST, US, and AU. It provides an intuitive dashboard with Excel-like interface, automated pattern detection for shift generation, and comprehensive scheduling capabilities.

## Features

- **Interactive Shift Calendar**: Excel-like grid interface with color-coded shifts
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Employee Management**: Add, edit, and delete employee profiles
- **Multiple Shift Types**: Support for various shifts (IST, US, AU) with color coding
- **Leave Management**: Schedule employee leaves and time-off
- **Week Off Management**: Set recurring week offs for employees
- **Pattern Detection**: Auto-detects shift patterns and suggests future schedules
- **Manual Assignment**: Manually assign shifts to employees for specific dates
- **Excel Export**: Export shift schedules to Excel format
- **Smart Generation**: Automatically generate future month schedules based on patterns

## Tech Stack

### Frontend
- React (TypeScript)
- XLSX.js for Excel operations
- Lucide React for icons
- Modern CSS with responsive design

### Backend
- Node.js with Express
- TypeScript
- MongoDB for database
- JWT for authentication

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, app runs in demo mode without DB)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shift-scheduler.git
   cd shift-scheduler
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the backend server**
   ```bash
   cd ../backend
   npm run build
   npm start
   ```

5. **Start the frontend application**
   ```bash
   cd ../frontend
   npm start
   ```

The application will run on http://localhost:3001 with the backend API on http://localhost:5000

## Usage Guide

For detailed usage instructions, please refer to the [documentation](#documentation) section below.

## Documentation

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
