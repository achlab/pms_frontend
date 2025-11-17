# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Components                         │
│  (Login, Dashboard, Profile, Invoices, Maintenance, etc.)       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Custom Hooks Layer                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  use-auth    │  │ use-profile  │  │  use-api-query     │   │
│  │  hooks       │  │  hooks       │  │  use-api-mutation  │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Service Layer                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │ Auth Service │  │Profile Service│ │  Future Services    │   │
│  │              │  │               │  │ (Dashboard, etc)    │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Client Layer                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Axios Instance (Singleton)                 │    │
│  │                                                         │    │
│  │  Request Interceptor → Add Bearer Token                │    │
│  │  Response Interceptor → Handle Errors                  │    │
│  │                                                         │    │
│  │  Token Manager → localStorage                          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend REST API                             │
│              http://localhost:8000/api                           │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Action Flow

```
User clicks "Login"
    ↓
Component calls useLogin() hook
    ↓
Hook calls authService.login()
    ↓
Service calls apiClient.post('/login', data)
    ↓
API Client adds Bearer token (if exists) via interceptor
    ↓
HTTP Request sent to backend
    ↓
Backend processes & responds
    ↓
Response interceptor catches response
    ↓
Success: Return data to service
Error: Transform to ApiClientError
    ↓
Service returns to hook
    ↓
Hook updates state (isLoading, data, error)
    ↓
Component re-renders with new state
    ↓
UI updates (show success/error)
```

### 2. Token Management Flow

```
Login Successful
    ↓
Backend returns { user, token }
    ↓
authService stores token via tokenManager
    ↓
tokenManager.setToken() → localStorage
    ↓
Future API requests automatically include token
    ↓
Request Interceptor adds: Authorization: Bearer {token}
```

### 3. Error Handling Flow

```
API Request fails
    ↓
Response Interceptor catches error
    ↓
Check error status:
    - 401 → Clear token, redirect to login
    - 422 → Validation error, extract field errors
    - 403 → Permission denied
    - 500 → Server error
    ↓
Transform to ApiClientError with metadata
    ↓
Throw error to calling code
    ↓
Hook catches error
    ↓
Hook sets error state
    ↓
Component displays error (toast/inline)
```

## Layer Responsibilities

### Component Layer
**Responsibility**: Presentation & User Interaction
- Render UI
- Handle user input
- Display loading states
- Show errors
- Navigate routes

**Does NOT**:
- Make direct API calls
- Handle business logic
- Manage tokens

### Hooks Layer
**Responsibility**: React State Management & API Integration
- Manage loading/error/success states
- Call service methods
- Provide React-friendly API
- Handle side effects

**Does NOT**:
- Make HTTP requests directly
- Store tokens
- Handle routing

### Service Layer
**Responsibility**: Business Logic & Domain Operations
- Encapsulate domain operations
- Call API client methods
- Transform data if needed
- Manage domain state

**Does NOT**:
- Know about React
- Manage UI state
- Handle rendering

### API Client Layer
**Responsibility**: HTTP Communication & Request/Response Handling
- Make HTTP requests
- Add authentication headers
- Handle errors globally
- Manage token storage
- Transform responses

**Does NOT**:
- Know about business logic
- Know about UI

## Design Patterns

### 1. Singleton Pattern
**Where**: API Client, Services, Token Manager
**Why**: Single source of truth, shared state

```typescript
class ApiClient {
  private static instance: ApiClient;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new ApiClient();
    }
    return this.instance;
  }
}
```

### 2. Factory Pattern
**Where**: Hooks
**Why**: Create configured instances of operations

```typescript
function useApiMutation(mutationFn, options) {
  return {
    mutate: (variables) => mutationFn(variables),
    // ... state
  };
}
```

### 3. Interceptor Pattern
**Where**: Axios Interceptors
**Why**: Centralized request/response modification

```typescript
axios.interceptors.request.use(
  (config) => {
    // Modify request
    return config;
  }
);
```

### 4. Repository Pattern
**Where**: Services
**Why**: Abstract data access

```typescript
class AuthService {
  async login(email, password) {
    return apiClient.post('/login', { email, password });
  }
}
```

### 5. Observer Pattern
**Where**: React Hooks
**Why**: Components subscribe to data changes

```typescript
const { data, isLoading } = useApiQuery(
  ['key'],
  fetchFn
);
// Component re-renders when data changes
```

## SOLID Principles Application

### Single Responsibility Principle (SRP)
- ✅ Each service handles ONE domain (auth, profile, etc.)
- ✅ Each hook handles ONE operation
- ✅ Each utility function does ONE thing

### Open/Closed Principle (OCP)
- ✅ Services are open for extension (add new methods)
- ✅ Closed for modification (existing code stable)
- ✅ Easy to add new services without changing existing ones

### Liskov Substitution Principle (LSP)
- ✅ All services follow same interface pattern
- ✅ All hooks return consistent structure
- ✅ Type-safe substitutions

### Interface Segregation Principle (ISP)
- ✅ Small, focused interfaces
- ✅ Services only expose needed methods
- ✅ Hooks provide specific functionality

### Dependency Inversion Principle (DIP)
- ✅ Components depend on hooks (abstraction)
- ✅ Hooks depend on services (abstraction)
- ✅ Services depend on API client (abstraction)

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Token Storage                                        │
│     └─→ localStorage (configurable)                     │
│                                                          │
│  2. Automatic Token Injection                           │
│     └─→ Request Interceptor adds Bearer token          │
│                                                          │
│  3. Token Validation                                     │
│     └─→ 401 errors trigger auto-logout                 │
│                                                          │
│  4. XSS Protection                                       │
│     └─→ React escapes by default                       │
│     └─→ No innerHTML usage                             │
│                                                          │
│  5. CSRF Protection                                      │
│     └─→ Can add CSRF token to headers                  │
│                                                          │
│  6. HTTPS Ready                                          │
│     └─→ All requests can use HTTPS                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Performance Optimizations

### 1. Singleton Instances
- Single API client instance
- Reused across entire app
- No re-initialization

### 2. Request Deduplication
- useApiQuery prevents duplicate requests
- Query key-based caching

### 3. Lazy Loading
- Services loaded on-demand
- Component code-splitting ready

### 4. Memoization
- Utility functions are pure
- Can be memoized easily

### 5. Debounce & Throttle
- Built-in utilities
- Reduce API calls

## Error Handling Strategy

```
┌──────────────────────────────────────────────────────────┐
│                 Error Handling Levels                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Level 1: API Client (Global)                            │
│  ├─ Catch all HTTP errors                                │
│  ├─ Transform to ApiClientError                          │
│  ├─ Handle 401 → Redirect to login                       │
│  └─ Classify error type                                  │
│                                                           │
│  Level 2: Service (Domain-specific)                      │
│  ├─ Catch service-specific errors                        │
│  ├─ Add domain context                                   │
│  └─ Rethrow with context                                 │
│                                                           │
│  Level 3: Hook (State Management)                        │
│  ├─ Catch errors from service                            │
│  ├─ Set error state                                      │
│  ├─ Call onError callback                                │
│  └─ Return error to component                            │
│                                                           │
│  Level 4: Component (UI)                                 │
│  ├─ Display user-friendly message                        │
│  ├─ Show toast notification                              │
│  ├─ Inline form errors                                   │
│  └─ Error recovery UI                                    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Scalability

### Horizontal Scaling (Adding Features)
```
1. Create new service
   └─→ lib/services/new.service.ts
   
2. Create hooks for service
   └─→ lib/hooks/use-new.ts
   
3. Create components
   └─→ components/new/

4. Add types
   └─→ lib/api-types.ts (add interfaces)

5. Export from index files
   └─→ services/index.ts, hooks/index.ts
```

### Vertical Scaling (Complexity)
```
1. Add middleware
   └─→ Interceptors can chain

2. Add caching layer
   └─→ Between hooks and services

3. Add offline support
   └─→ Service worker + IndexedDB

4. Add state management
   └─→ Redux/Zustand if needed
```

## Testing Strategy

```
┌──────────────────────────────────────────────────────────┐
│                    Testing Pyramid                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│                    ▲                                      │
│                   ╱ ╲  E2E Tests                          │
│                  ╱   ╲ (Cypress/Playwright)               │
│                 ╱─────╲                                   │
│                ╱       ╲ Integration Tests                │
│               ╱         ╲ (React Testing Library)         │
│              ╱───────────╲                                │
│             ╱             ╲ Unit Tests                    │
│            ╱               ╲ (Vitest/Jest)                │
│           ╱─────────────────╲                             │
│                                                           │
│  Unit Tests:                                              │
│  - Services (pure functions)                              │
│  - Utilities (pure functions)                             │
│  - API client methods                                     │
│                                                           │
│  Integration Tests:                                       │
│  - Hooks with mock API                                    │
│  - Components with hooks                                  │
│                                                           │
│  E2E Tests:                                               │
│  - Complete user flows                                    │
│  - Real API calls                                         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0  
**Last Updated**: Session 1  
**Status**: ✅ Production Ready

