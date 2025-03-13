# Card Game Project

## Introduction

This is a hobby porject ,where I have built a multiplayer card game "cheat" in order to improve my skills in full-stack development and problem solving. My goal for this project was to create an interactive real-time online multiplayer version of the popular game "cheat" with slightly modified game rules.

Please note that the code may not follow best practices and the way it's written may seem counterintuitive at best and wrong at worst, please keep in mind this is a hobby project is solely intended for learning purposes.  

the game can be played here : https://superb-kulfi-fa8c06.netlify.app/ (A domain name upgrade is being considered.)

## Technical Details

### Main Technologies Used

-   **Frontend:** [ReactJS](https://react.dev/)
-   **Backend:** [ExpressJS](https://expressjs.com/)
-   **Database:** [MongoDB](https://www.mongodb.com/) (although ,the database is ready and I'm able to communicate with it ,I saw no real value in storing any information for now).
-   **Real-time Communication:** [SocketIO](https://socket.io/)

### Other Libraries & Tools

#### Frontend :

-   **[dnd-kit](https://dndkit.com/)** for the drag and drop functionality.
-   **[ReactBoostrap](https://react-bootstrap.netlify.app/)** for general styling.
-   **[TailwindCSS](https://tailwindcss.com/)** for additional styling.
-   **[validator](https://www.npmjs.com/package/validator)** for validating varying inputs.
-   **[ractjs-popup](https://www.npmjs.com/package/reactjs-popup)** for handling some popups inside of the game (in hindsight ,this could have been replaced with ReactBoostrap Modals).

#### Backend :

-   **[cors](https://www.npmjs.com/package/cors)** CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
-   **[dotenv](https://www.npmjs.com/package/dotenv)** Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. Storing configuration in the environment separate from code is based on The Twelve-Factor App methodology.
-   **[mongoose](https://mongoosejs.com/)** Mongoose provides a straight-forward, schema-based solution to model your application data. It includes built-in type casting, validation, query building, business logic hooks and more, out of the box.

### External Services

-   **Hosting:** [Netlify](https://www.netlify.com/) where I hosted the frontend / [Render](https://render.com/) where I hosted the backend.

## Improvements & Future Enhancements

While the game is functional, there are several areas where it could be improved:

-   **Better UI/UX:** Enhancing animations, transitions, and game feedback for a smoother experience.
-   **Mobile Optimization:** Improving responsiveness and adding mobile-friendly controls.
-   **AI Players:** Implementing bot players to allow single-player mode.
-   **More Game Modes:** Adding variations of the game with different rules.
-   **Persistent Game State:** Saving progress and allowing players to resume interrupted games.
-   **Leaderboards & Stats:** Tracking player performance and showing rankings.

Feel free to contribute or suggest further improvements!

---

Developed with ❤️ as a hobby project.
