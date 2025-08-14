# Contributing to Mental Health Support Matcher

Thank you for your interest in contributing to the Mental Health Support Matcher project! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug Reports**: Report bugs and issues
- **Feature Requests**: Suggest new features
- **Code Contributions**: Submit pull requests
- **Documentation**: Improve documentation
- **Testing**: Write or improve tests
- **Design**: UI/UX improvements
- **Translation**: Help with internationalization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- MongoDB (local or Atlas)
- Google Gemini API key

### Setup Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/mental-health-support-matcher.git
   cd mental-health-support-matcher
   ```

2. **Run the setup script**
   ```bash
   # On Windows
   setup.bat
   
   # On Unix/Linux/macOS
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configure environment variables**
   - Copy `server/env.example` to `server/.env`
   - Copy `client/env.example` to `client/.env`
   - Update with your actual credentials

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

## 📝 Development Guidelines

### Code Style

#### JavaScript/React
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions

#### Backend
- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Implement proper error handling
- Add input validation
- Use meaningful variable names

### File Structure

```
client/src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API service calls
├── utils/         # Helper functions
├── context/       # Context providers
├── assets/        # Images, logos, icons
└── styles/        # Global styles

server/
├── routes/        # API route handlers
├── controllers/   # Business logic
├── services/      # Database & external services
├── models/        # Mongoose models
├── middlewares/   # Authentication & error handling
├── utils/         # Helper functions
├── config/        # Database & environment setup
└── socket/        # Socket.io setup
```

### Naming Conventions

- **Files**: Use kebab-case (e.g., `user-profile.jsx`)
- **Components**: Use PascalCase (e.g., `UserProfile`)
- **Variables**: Use camelCase (e.g., `userName`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Database**: Use snake_case (e.g., `user_profiles`)

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

- Write tests for new features
- Maintain test coverage above 80%
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Test Structure

```javascript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup
  })

  afterEach(() => {
    // Cleanup
  })

  it('should do something specific', () => {
    // Test implementation
  })
})
```

## 🔄 Git Workflow

### Branch Naming

Use descriptive branch names:
- `feature/user-authentication`
- `bugfix/login-error`
- `hotfix/security-patch`
- `docs/api-documentation`

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
feat(auth): add JWT token refresh functionality
fix(chat): resolve message duplication issue
docs(api): update authentication endpoints
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Use the PR template
   - Describe your changes
   - Link related issues
   - Request reviews

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design tested

## Screenshots (if applicable)
```

## 🐛 Bug Reports

### Before Submitting

1. Check existing issues
2. Search for similar problems
3. Try to reproduce the issue
4. Check browser console for errors

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Version: [e.g., 1.0.0]

## Additional Information
Screenshots, logs, etc.
```

## 💡 Feature Requests

### Before Submitting

1. Check existing feature requests
2. Consider the impact on existing features
3. Think about implementation complexity
4. Consider user experience

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## Alternative Solutions
Other approaches considered

## Impact
- User experience impact
- Technical impact
- Performance impact

## Additional Information
Mockups, examples, etc.
```

## 🔒 Security

### Security Guidelines

- Never commit sensitive data
- Use environment variables for secrets
- Validate all user inputs
- Implement proper authentication
- Follow OWASP guidelines
- Report security issues privately

### Reporting Security Issues

For security issues, please email: security@mentalhealthmatcher.com

## 📚 Documentation

### Documentation Standards

- Keep documentation up to date
- Use clear, concise language
- Include code examples
- Add screenshots when helpful
- Follow markdown conventions

### Documentation Types

- **API Documentation**: Use JSDoc comments
- **Component Documentation**: Include props and examples
- **Setup Guides**: Step-by-step instructions
- **Troubleshooting**: Common issues and solutions

## 🎨 Design Guidelines

### UI/UX Principles

- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1)
- Consistent design language
- Intuitive user experience
- Fast loading times

### Design System

- Use Material UI components
- Follow established color scheme
- Maintain consistent spacing
- Use appropriate typography
- Include proper loading states

## 🌍 Internationalization

### i18n Guidelines

- Use translation keys
- Support RTL languages
- Consider cultural differences
- Test with different locales
- Maintain translation files

## 📊 Performance

### Performance Guidelines

- Optimize bundle size
- Implement lazy loading
- Use proper caching strategies
- Monitor Core Web Vitals
- Optimize database queries

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Help others learn
- Provide constructive feedback
- Follow project guidelines
- Report inappropriate behavior

### Communication

- Use clear, professional language
- Be patient with newcomers
- Provide helpful feedback
- Ask questions when needed
- Share knowledge and resources

## 🏆 Recognition

### Contributors

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation
- Community acknowledgments

### Contribution Levels

- **Bronze**: 1-5 contributions
- **Silver**: 6-15 contributions
- **Gold**: 16+ contributions
- **Platinum**: Major features or long-term commitment

## 📞 Support

### Getting Help

- Check documentation first
- Search existing issues
- Ask in discussions
- Join community chat
- Contact maintainers

### Resources

- [Project Documentation](README.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Community Chat](link-to-chat)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Mental Health Support Matcher! Your contributions help make mental health support more accessible to everyone. 🌟
