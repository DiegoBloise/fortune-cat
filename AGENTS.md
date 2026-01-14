# Fortune Cat - Agent Guidelines

## Development Commands
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run serve` - Fallback HTTP server (Python)
- No linting or test commands configured yet

## Code Style Guidelines

### Architecture
- ES6+ classes with clear separation: `src/game/` for logic, `src/ui/` for interface
- Async/await for animations and game operations
- Event-driven patterns with proper error handling

### Naming Conventions
- camelCase for variables, methods, and properties
- PascalCase for class names
- Portuguese for user-facing strings, English for code

### Canvas & Animation
- Use Canvas API for all game rendering
- RequestAnimationFrame for smooth animations
- Promise-based animation methods

### Data & Storage
- LocalStorage for persistence (wallet, stats)
- Try-catch blocks for storage operations
- JSON serialization with fallbacks

### Error Handling
- Graceful degradation for canvas failures
- Console warnings for non-critical issues
- User-friendly error messages in Portuguese