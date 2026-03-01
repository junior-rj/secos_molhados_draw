# Secos & Molhados Tennis Draw System 2026

Official automated draw system for the Secos & Molhados recreational tennis tournament at Tijuca Tenis Clube. This application manages the pairings for the 2026 season ensuring compliance with the tournament rules and preventing repeated matches.

## Business Rules Implemented

* Separate draws for Female and Male divisions.
* Maximum of 14 female players and 30 male players per session.
* Algorithm prevents players from facing the same partner twice during the year based on historical data.
* Exception rule applied for the last pair of the draw if no unique combination is mathematically possible.
* Access restricted to authorized board members via authenticated login.

## Technology Stack

* Frontend Framework: React 18 with Vite
* Styling: Tailwind CSS
* Authentication: Firebase Auth
* Database: Firebase Firestore
* Hosting: GitHub Pages

## Administration

Only authorized emails registered directly in the Firebase Authentication console can access the draw interface. To add a new tournament director, the system administrator must manually create the user credentials in the Firebase dashboard.

## License

Private repository. All rights reserved to the Secos & Molhados Board of Directors.
