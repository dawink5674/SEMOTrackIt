# SEMOTrackIt

This project is developed as part of CS445 Software Engineering I, following the Software Development Life Cycle (SDLC). The app can be built as a desktop, mobile, or web application using any programming language (e.g., Java, C++, C#, JavaScript), ensuring it runs as a working prototype free of viruses/malware.

## Setup Instructions

1. Ensure Node.js and npm are installed.
2. Clone the repository.
3. Run `npm install` to install dependencies.
4. Configure Firebase: Update `src/services/FirebaseService.js` with your Firebase project keys.
5. Run `npx expo start` to start the development server.
6. Scan the QR code with Expo Go app on your device or run on an emulator.

## Features
- Real-time shuttle tracking via Firebase.
- Map visualization with user location.
- User authentication.

## Project Structure
- `src/components/`: Reusable components like MapComponent.
- `src/screens/`: App screens like HomeScreen and LoginScreen.
- `src/services/`: Firebase integration.
- `src/models/`: Data models for Shuttle, Route, User, Stop.
