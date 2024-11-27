# Lords & Legends Character Manager

Lords & Legends Character Manager is a web application designed to help users create, view, manage, and delete characters for RPG campaigns or game systems. It allows players to define characters' attributes, equipment, skills, and more, providing a streamlined and visually appealing interface.

## Features

### Character Management
- **Create Characters**: Multi-step form for creating characters with customizable attributes, including race, vocation, stats, and more.
- **View Characters**: A character summary page displaying detailed information about all characters associated with a user.
- **Update Characters**: Modify attributes, skills, and other details of existing characters (planned).
- **Delete Characters**: Remove characters and their associated data with confirmation and seamless UI updates.

### User Authentication
- Secure user authentication for personalized character data.
- Association of characters with specific users.

### Data Handling
- **Attributes**: Character stats like HP, strength, agility, intelligence, and charisma.
- **Complex Data**: Lists of spells, skills, weapons, equipment, and micro-stats presented in an organized, readable format.
- **Dynamic Updates**: Attributes and abilities dynamically adjusted based on race and vocation selections.

### Responsive UI
- Styled using Emotion CSS with a consistent theme.
- Integrated Bootstrap components for responsive and accessible design.
- Dynamic updates for better user experience.

## Tech Stack

### Frontend
- **React**: Component-based architecture for building dynamic and interactive UI.
- **Emotion**: CSS-in-JS library for flexible and scalable styling.
- **React-Bootstrap**: Pre-styled components for faster UI development.
- **Redux**: State management for user and character data.

### Backend
- **Node.js**: Server-side JavaScript runtime.
- **Express**: Lightweight web application framework.
- **PostgreSQL**: Relational database for persistent data storage.

### Deployment
- Local development environment using `npm` or `yarn`.
- Production-ready server with robust error handling.

## Installation

### Prerequisites
- Node.js v14+ installed
- PostgreSQL database installed and running

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/lords-legends-character-manager.git
   cd lords-legends-character-manager
Install dependencies:

bash
Copy code
npm install
Set up environment variables: Create a .env file in the root directory with the following:

plaintext
Copy code
PORT=5001
DATABASE_URL=postgres://username:password@localhost:5432/your-database-name
Set up the database: Run the SQL scripts in the /database folder to create tables and seed data if necessary.

Start the server:

bash
Copy code
npm run dev
Access the application: Open your browser and navigate to http://localhost:3000.

Usage
Creating Characters
Navigate to the "Create Character" section.
Fill out the form with your desired attributes, including race, vocation, and other stats.
Submit the form to save the character to your account.
Managing Characters
View all characters on the "Character Summary" page.
Delete a character by clicking the Delete button on its card.
File Structure
plaintext
Copy code
lords-legends-character-manager/
├── client/               # React frontend
│   ├── components/       # Reusable UI components
│   ├── pages/            # Main page components
│   ├── styles/           # Theme and Emotion CSS
│   └── App.js            # Main application file
├── server/               # Express backend
│   ├── routes/           # API routes
│   ├── data/             # Static data (e.g., races, vocations)
│   ├── modules/          # Middleware and utilities
│   └── index.js          # Server entry point
├── database/             # SQL scripts for database setup
├── README.md             # Project documentation
├── package.json          # Node.js dependencies and scripts
└── .env                  # Environment variables
Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch:
bash
Copy code
git checkout -b feature-name
Commit your changes:
bash
Copy code
git commit -m "Description of changes"
Push to the branch:
bash
Copy code
git push origin feature-name
Open a pull request on GitHub.
License
This project is licensed under the MIT License. See the LICENSE file for more information.

Acknowledgments
Bootstrap: For responsive components and grid system.
Emotion: For CSS-in-JS styling.
Redux: For efficient state management.
RPG inspiration: Thanks to all RPG creators for fueling our imagination!
