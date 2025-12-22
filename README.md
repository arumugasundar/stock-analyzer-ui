# Time-Series Stock Analyzer (UI)

This is a react based frontend application responsible for uploading excel file along with paramters to perform computations on time-series data

# Project Setup

Follow the instructions below to get the application up and running on your local machine.

---

## 🚀 Getting Started

### 1. Prerequisites
Before starting, ensure you have **Node.js** and **npm** installed on your system. You can verify this by running the following commands in your terminal:

```bash
node -v
npm -v
```

## 2. Installation
Clone the repository and navigate into the project directory:

```bash
git clone https://github.com/arumugasundar/stock-analyzer-ui.git
cd stock-analyzer-ui
```
Install the required dependencies:

```bash
npm install
```
## 3. Environment Configuration
The application requires environment variables to function correctly.

 - Create a .env file in the root directory.

 - Refer to the .env.example file for the required keys.

 - Add your local configuration values.

## 4. Running the App
To start the development server with hot-reloading:

```bash
npm run dev
```

## 5. Build & Verification
To ensure your changes are production-ready and compatible with our GitHub Actions deployment pipeline, run the build command:

```bash
npm run build
```