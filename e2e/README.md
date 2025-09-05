# End-to-End Tests

This directory contains comprehensive end-to-end tests for the CRM MVP application using Playwright.

## Test Structure

### Test Files

- **`auth.spec.ts`** - Authentication flow tests (login, register, password reset)
- **`contacts.spec.ts`** - Contact management CRUD operations and features
- **`deals.spec.ts`** - Deal pipeline management and Kanban functionality
- **`activities.spec.ts`** - Activity tracking and follow-up management
- **`dashboard.spec.ts`** - Dashboard metrics and reporting features
- **`complete-workflow.spec.ts`** - End-to-end user workflows and integration tests

### Utilities

- **`utils/test-helpers.ts`** - Common test utilities and test data

## Running Tests

### Prerequisites

1. Ensure the development server is running:
   ```bash
   npm run dev
   ```

2. Install Playwright browsers (first time only):
   ```bash
   npx playwright install
   ```

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests step by step
npm run test:e2e:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium

# Generate and view test report
npm run test:e2e:report
```

## Test Coverage

### Authentication Flow
- ✅ User registration with validation
- ✅ User login with error handling
- ✅ Password reset functionality
- ✅ Session management and route protection
- ✅ Form validation and error states

### Contact Management
- ✅ Create, read, update, delete contacts
- ✅ Search and filter functionality
- ✅ Contact form validation
- ✅ CSV import/export
- ✅ Duplicate detection and handling
- ✅ Contact details and activity timeline

### Deal Pipeline
- ✅ Create and manage deals
- ✅ Kanban board functionality
- ✅ Move deals between stages
- ✅ Deal form validation
- ✅ Pipeline metrics calculation
- ✅ Overdue deal highlighting
- ✅ Deal export functionality

### Activity Management
- ✅ Log completed activities
- ✅ Schedule future activities
- ✅ Activity timeline display
- ✅ Follow-up scheduling
- ✅ Activity filtering and search
- ✅ Overdue activity highlighting
- ✅ Activity completion tracking

### Dashboard and Reporting
- ✅ Key metrics display
- ✅ Contact statistics breakdown
- ✅ Pipeline value calculations
- ✅ Recent activities feed
- ✅ Upcoming tasks display
- ✅ Chart visualizations
- ✅ Real-time data updates
- ✅ Mobile responsiveness

### Complete Workflows
- ✅ Full user journey from registration to deal closure
- ✅ Data import/export workflows
- ✅ Session management and security
- ✅ Cross-feature integration

## Test Data

The tests use predefined test data from `utils/test-helpers.ts`:

```typescript
const testData = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User'
  },
  testContact: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    // ... more fields
  },
  // ... more test data
}
```

## Test Environment

### Configuration

The tests are configured to:
- Run against `http://localhost:5173` (Vite dev server)
- Use multiple browsers (Chrome, Firefox, Safari, Mobile)
- Capture screenshots on failure
- Record videos for failed tests
- Generate detailed HTML reports

### Data Isolation

Each test suite:
- Starts with a clean authentication state
- Uses consistent test data
- Cleans up after itself where possible
- Handles existing data gracefully

## Debugging Tests

### Visual Debugging
```bash
# Run with browser visible
npm run test:e2e:headed

# Run in debug mode with step-by-step execution
npm run test:e2e:debug
```

### Test Reports
```bash
# Generate and view HTML report
npm run test:e2e:report
```

### Screenshots and Videos
- Screenshots are automatically captured on test failures
- Videos are recorded for failed tests
- Traces are captured for debugging

## Best Practices

### Test Selectors
- Use `data-testid` attributes for reliable element selection
- Avoid CSS selectors that may change with styling updates
- Use semantic selectors when `data-testid` is not available

### Waiting Strategies
- Use `waitForSelector` for dynamic content
- Use `waitForLoadState` for page navigation
- Implement custom wait helpers for loading states

### Error Handling
- Verify error messages and validation states
- Test both success and failure scenarios
- Handle network failures and timeouts gracefully

### Mobile Testing
- Include mobile viewport testing
- Test touch interactions
- Verify responsive design functionality

## Continuous Integration

These tests are designed to run in CI environments:
- Headless mode by default in CI
- Retry failed tests automatically
- Generate artifacts for debugging
- Support parallel execution

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout values or improve wait strategies
2. **Element not found**: Check if `data-testid` attributes are present
3. **Authentication issues**: Verify test user credentials and auth flow
4. **Database state**: Ensure tests handle existing data appropriately

### Debug Commands
```bash
# Run single test with debug output
npx playwright test auth.spec.ts --debug

# Run with verbose logging
npx playwright test --reporter=line

# Generate trace for failed tests
npx playwright test --trace=on
```