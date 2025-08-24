React + Vite

This template provides a minimal setup to get React working in Vite with HMR (Hot Module Replacement) and some ESLint rules.

Currently, two official plugins are available:

@vitejs/plugin-react
– uses Babel
for Fast Refresh.

@vitejs/plugin-react-swc
– uses SWC
for Fast Refresh.

Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the TS template
for information on how to integrate TypeScript and typescript-eslint
in your project.

Portfolio Website

This repository hosts my personal portfolio website built with React and Vite. The website showcases my projects, skills, and contact information.

🔗 Live Site: https://ferans-portfolio-website.netlify.app/

Features

Fast Refresh: Instant reload during development.

Responsive Design: Works seamlessly across desktop, tablet, and mobile.

Modern Styling: Built with Tailwind CSS and custom UI components.

Interactive Sections: Projects, contact form, and theme toggle.

Optimized Build: Minimal bundle size and efficient production setup.

Getting Started

Clone the repository:

git clone https://github.com/your-username/portfolio-website.git
cd portfolio-website

Install dependencies:

npm install

Run the development server:

npm run dev

Build for production:

npm run build

Preview the production build:

npm run preview

Project Structure
├─ public/ # Static assets
├─ src/
│ ├─ components/ # Reusable UI components
│ ├─ pages/ # Page components
│ ├─ hooks/ # Custom React hooks
│ ├─ styles/ # Global styles
│ └─ main.jsx # Entry point
├─ package.json
└─ vite.config.js # Vite configuration

Contributing

Contributions are welcome! Feel free to submit issues or pull requests for bug fixes, enhancements, or new features.

License

This project is licensed under the MIT License. See the LICENSE
file for details.
