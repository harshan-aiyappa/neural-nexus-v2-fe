# Neural Nexus V2 - Frontend

This is the V2 frontend for the Neural Nexus project, designed to connect exclusively with the `neural-nexus-v2-be` Gemini-powered backend.

## Architectural Changes (V2)
1. **Conditional Arrow Rendering**: Implements the V2 mandate to only render 3D arrows for hierarchical data, using simple lines for basic associations.
2. **Premium 3D Engine**: Uses `react-three-fiber`.
3. **Optimized API Integration**: Connects to the new REST endpoints that utilize Neo4j Native Labels instead of property filtering.

## Setup

1. Install Dependencies:
   ```bash
   npm install
   ```
2. Start Dev Server:
   ```bash
   npm run dev
   ```
