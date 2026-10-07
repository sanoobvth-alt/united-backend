# Backend Architecture & Framework Decisions

## ✅ Current Setup

- Layered Architecture
- MVC style API
- REST API architecture

## Core Dependencies

| Package       | Purpose                          |
| ------------- | -------------------------------- |
| express       | Create server and routes         |
| cors          | Allow frontend to access backend |
| cookie-parser | Read cookies                     |
| morgan        | Log requests                     |

## Why Is HBS Mostly Seen in Older Projects?

Handlebars became popular when:

- jQuery era was dominant
- Server-rendered apps were common
- React, Vue, Angular were not mainstream

After SPA frameworks like React became popular, people preferred modern approaches.
Template engines reduced in popularity for large apps.

## Template Engines vs React

### Use Template Engines (EJS, HBS) when:

- Small project
- Simple admin panel
- SEO important
- Minimal interactivity
- Monolithic backend

### Use React when:

- Complex UI
- Many state changes
- Real-time updates
- Mobile app like experience
- Large scale app

## Why Modern Apps Rarely Use EJS

Modern frontend needs:

- Component-based UI
- State management
- Client-side routing
- Reusability
- Better developer experience

Template engines limitations:

- Server-bound
- Not component-driven
- Harder to scale large UI systems

React ecosystem advantages:

- Huge community
- Reusable components
- Better tooling
- SPA behavior

## Next.js + Separate Node API Architecture

**Main reason:** Separation of concerns + scale

In larger systems:

- Frontend evolves independently
- Backend becomes shared infrastructure
- Multiple front-ends consume same API:
  - Web app (Next.js)
  - Mobile app (React Native)
  - Admin dashboard
  - Public website

## Production-Ready Considerations

### Logging

- Structured logging (Winston, Pino)
- Log levels (error, warn, info, debug)
- Centralized log aggregation
- Request/response tracking

### Audit Trails

- Track user actions and changes
- Timestamp all modifications
- Store who changed what and when
- Essential for compliance and debugging

### Caching Strategy

- Redis for session/data caching
- API response caching
- Database query caching
- Cache invalidation patterns

### Modular Monolith Pattern

- Organized module structure
- Clear domain boundaries
- Independent module lifecycle
- Easier to extract into microservices later

### Role-Based Access Control (RBAC)

- Define user roles (admin, user, moderator)
- Permission-based endpoint access
- Middleware for authorization checks
- Granular resource-level permissions
