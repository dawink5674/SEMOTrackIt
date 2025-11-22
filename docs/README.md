# SEMOTrackIt

This project is developed as part of CS445 Software Engineering I, following the Software Development Life Cycle (SDLC). The app can be built as a desktop, mobile, or web application using any programming language (e.g., Java, C++, C#, JavaScript), ensuring it runs as a working prototype free of viruses/malware.

## Web App Setup

The web app is a static site served using Node.js.

1. Ensure Node.js and npm are installed.
2. Clone the repository.
3. Navigate to the `web-app` directory: `cd web-app`.
4. Run `npm install` to install dependencies.
5. Start the development server: `npx serve .` (or use the VS Code task "Serve Web App").
6. Open your browser and go to `http://localhost:3000` (or the port shown in the terminal).

Note: The web app currently provides a basic interface. Firebase integration may need to be added separately if required.

A mobile version is planned for future development.

## Features
- Basic web interface for tracking (to be expanded).
- Real-time shuttle tracking via Firebase (planned for mobile).
- Map visualization with user location (planned for mobile).
- User authentication (planned for mobile).

## Project Structure
- `web-app/`: Web application files including `index.html`, `script.js`, `styles.css`.
- `src/`: Directory for future mobile app components, screens, services, and models (planned).

## Using Git in VS Code

To manage version control:

1. Open the Source Control view (Ctrl+Shift+G or click the branch icon in the sidebar).
2. Stage changes: Click the `+` next to files to stage them.
3. Enter a commit message in the text box.
4. Commit: Click the checkmark icon or press Ctrl+Enter.
5. Push changes: Click the sync icon or use the `...` menu > Push.

For pulling updates: Use the sync icon or `...` menu > Pull.

## Using GitHub Copilot

GitHub Copilot is an AI-powered code completion tool integrated into VS Code.

1. Ensure the GitHub Copilot extension is installed and authenticated.
2. While coding, Copilot will suggest code completions inline (accept with Tab).
3. Use comments to guide suggestions, e.g., `// Function to fetch shuttle data`.
4. For chat assistance: Open the Copilot Chat view (Ctrl+Alt+I) and ask questions about code.
5. Copilot can help generate code, explain snippets, or debug issues specific to this project, like integrating Firebase or updating the map component.
