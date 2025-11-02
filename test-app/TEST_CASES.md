# Test Cases for TestApp

## Test Case 1: User Login Flow
**Test ID**: TC001  
**Test Name**: User Login and Authentication  
**Priority**: High  
**Description**: Verify user can successfully log in with valid credentials and access protected pages  

### Preconditions:
- Test application is running on http://localhost:8080
- Browser is launched and ready

### Test Steps:
1. Navigate to the home page (http://localhost:8080)
2. Verify home page loads with title "Test App - Home"
3. Click "Get Started" button
4. Verify redirect to login page
5. Verify login form is displayed with username and password fields
6. Enter valid credentials (username: "testuser", password: "password123")
7. Click "Login" button
8. Verify success message appears
9. Verify redirect to products page
10. Verify user welcome message shows logged username
11. Verify logout button is visible

### Expected Results:
- Home page loads successfully
- Login form accepts valid credentials
- User is redirected to products page after successful login
- User info section shows welcome message with username
- Logout functionality is available

### Test Data:
- Valid Username: testuser
- Valid Password: password123

---

## Test Case 2: Product Search and Navigation
**Test ID**: TC002  
**Test Name**: Product Search and Filtering  
**Priority**: High  
**Description**: Verify product search functionality and navigation between pages  

### Preconditions:
- User is logged in (complete TC001 first)
- User is on products page

### Test Steps:
1. Verify products page displays grid of products
2. Count total number of products displayed (should be 6)
3. Verify search box is present and functional
4. Search for "Electronics" in the search box
5. Click "Search" button
6. Verify filtered results show only Electronics products
7. Count filtered products (should be 3: Wireless Headphones, Smartphone, Gaming Mouse)
8. Click "Clear" button
9. Verify all products are displayed again
10. Search for "Wireless" using Enter key
11. Verify only "Wireless Headphones" is displayed
12. Click on a product's "Select Product" button
13. Verify alert dialog appears with product information
14. Navigate to Contact page using navigation menu

### Expected Results:
- Products are displayed in a grid layout
- Search functionality filters products correctly
- Clear button resets the search
- Product selection shows product details
- Navigation between pages works correctly

### Test Data:
- Search terms: "Electronics", "Wireless"
- Expected product count: 6 total, 3 Electronics, 1 Wireless

---

## Test Case 3: Contact Form Submission
**Test ID**: TC003  
**Test Name**: Contact Form Validation and Submission  
**Priority**: Medium  
**Description**: Verify contact form validation, submission, and error handling  

### Preconditions:
- User is logged in
- User is on contact page

### Test Steps:
1. Verify contact form is displayed with all required fields
2. Verify full name field is pre-filled with logged username
3. Attempt to submit form without filling required fields
4. Verify error message is displayed
5. Fill out the contact form with valid data:
   - Full Name: "Test User"
   - Email: "testuser@example.com"
   - Phone: "123-456-7890"
   - Subject: "General Inquiry"
   - Message: "This is a test message for automation testing"
6. Check the newsletter subscription checkbox
7. Click "Send Message" button
8. Verify submit button shows "Sending..." during processing
9. Verify success message appears after submission
10. Verify form is reset after successful submission
11. Test invalid email validation by entering invalid email
12. Verify error message for invalid email

### Expected Results:
- Contact form displays all required fields
- Form validation prevents submission of incomplete data
- Valid form submission shows success message
- Form resets after successful submission
- Invalid email triggers validation error
- User feedback is clear and appropriate

### Test Data:
- Valid Email: testuser@example.com
- Invalid Email: invalid-email
- Phone: 123-456-7890
- Subject: General Inquiry
- Message: This is a test message for automation testing

---

## Test Environment Setup:
1. Start test application server: `node server.js` from test-app directory
2. Application will be available at http://localhost:8080
3. Use Chrome browser for testing (can be configured for other browsers)
4. Tests should run in headless mode for CI/CD integration

## Test Data Summary:
- Login Credentials: testuser / password123
- Test Email: testuser@example.com
- Base URL: http://localhost:8080
- Expected Products Count: 6 total
- Electronics Products: 3 (Wireless Headphones, Smartphone, Gaming Mouse)