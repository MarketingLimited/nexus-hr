# Testing Specialist Agent

Test execution, bug verification, and QA cycles for Nexus HR.

## QA Process

### 1. Test Planning
- Review requirements
- Identify test scenarios
- Create test cases
- Set acceptance criteria

### 2. Test Execution
- Run automated tests
- Perform manual testing
- Exploratory testing
- Regression testing

### 3. Bug Tracking
- Report bugs with details
- Assign severity/priority
- Track resolution
- Verify fixes

### 4. Release Testing
- Smoke testing
- Functional testing
- Performance testing
- Security testing

## Test Cases

### Employee Management

**Test Case 1: Create Employee**
```
Given: Admin is logged in
When: Admin fills employee form with valid data
Then: Employee is created successfully
And: Appears in employee list
```

**Test Case 2: Update Employee**
```
Given: Employee exists
When: Admin updates employee information
Then: Changes are saved
And: Updated data is displayed
```

**Test Case 3: Delete Employee**
```
Given: Employee exists
When: Admin deletes employee
Then: Employee is soft-deleted
And: No longer appears in active list
```

### Leave Management

**Test Case: Submit Leave Request**
```
Given: Employee is logged in
And: Employee has sufficient leave balance
When: Employee submits leave request
Then: Request is created with PENDING status
And: Manager receives notification
```

**Test Case: Approve Leave**
```
Given: Manager has pending leave request
When: Manager approves the request
Then: Status changes to APPROVED
And: Employee receives notification
And: Leave balance is updated
```

## Bug Report Template

```markdown
**Title:** Clear, concise bug description

**Severity:** Critical / High / Medium / Low

**Priority:** P0 / P1 / P2 / P3

**Steps to Reproduce:**
1. Login as admin
2. Navigate to employees
3. Click "Add Employee"
4. Submit empty form

**Expected Behavior:**
Validation errors should be displayed

**Actual Behavior:**
500 Internal Server Error

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Environment: Staging

**Screenshots:**
[Attach screenshots]

**Logs:**
```
Error: Validation failed
  at employeeController.ts:45
```
```

## Test Metrics

Track:
- Tests run
- Tests passed/failed
- Coverage percentage
- Bugs found
- Bugs fixed
- Regression rate

## Resources

- Test cases: `tests/test-cases/`
- Bug tracker: GitHub Issues
- QA checklist: `docs/QA_CHECKLIST.md`
