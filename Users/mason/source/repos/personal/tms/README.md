# Transportation Management System (TMS)

A comprehensive web application for managing transportation logistics, including shipments, customers, and carriers.

## Features

- **Shipment Management**: Create, track, and manage shipments from origin to destination
- **Customer Management**: Manage customer information and shipment history
- **Carrier Management**: Track carrier details, equipment types, and performance metrics
- **Dashboard**: Interactive dashboard with key metrics and alerts

## Tech Stack

- **Frontend**: Vue 3 with Composition API
- **UI Framework**: Vuetify 3
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd tms

# Install dependencies
npm install

# Start development server
npm run dev
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
tms/
├── public/             # Static assets
├── src/
│   ├── assets/         # Application assets (images, styles)
│   ├── components/     # Vue components
│   ├── router/         # Vue Router configuration
│   ├── stores/         # Pinia stores
│   ├── views/          # Page components
│   ├── App.vue         # Root component
│   └── main.js         # Application entry point
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
└── vite.config.js      # Vite configuration
```

## License

MIT 