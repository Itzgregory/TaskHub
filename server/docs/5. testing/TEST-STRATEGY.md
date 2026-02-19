# Test Strategy: TaskHub

**Date:** 2026-02-19  
**Target Coverage:** 80%+  
**Testing Pyramid:** 70% Unit, 20% Integration, 10% E2E  

---

## Testing Approach

### Unit Tests (Domain + Application)
**Scope:** Business logic, validation, domain rules  
**Framework:** xUnit + FluentAssertions  
**Mocking:** NSubstitute  
**Target:** 80%+ coverage  

**What to Test:**
- Domain entities (User, TodoItem, Organisation)
- Value objects (Tag, Email validation)
- Use case handlers (CreateTodo, Login, etc.)
- Validators (input validation logic)

**Example:**
```csharp
[Fact]
public void TodoItem_Archive_ShouldSetIsArchivedTrue()
{
    // Arrange
    var todo = TodoItem.Create(orgId, userId, "Task", null, Priority.Medium, [], null, DateTime.UtcNow);
    
    // Act
    todo.Archive(DateTime.UtcNow);
    
    // Assert
    todo.IsArchived.Should().BeTrue();
    todo.Status.Should().Be(TodoStatus.Archived);
}
```

---

### Integration Tests (Infrastructure + API)
**Scope:** Repository implementations, middleware, full request/response  
**Framework:** xUnit + WebApplicationFactory  
**Database:** InMemory storage  
**Target:** Key user journeys  

**What to Test:**
- Repository CRUD operations
- File storage atomic writes
- API endpoints with authentication
- Exception handling middleware

**Example:**
```csharp
[Fact]
public async Task CreateTodo_WithValidData_Returns201()
{
    // Arrange
    var client = _factory.CreateClient();
    var command = new { orgId = _testOrgId, title = "Test Todo", priority = "Medium" };
    
    // Act
    var response = await client.PostAsJsonAsync("/api/v1/todos", command);
    
    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.Created);
}
```

---

### End-to-End Tests (Critical Paths)
**Scope:** Complete user journeys  
**Framework:** Playwright/Selenium (future)  
**Target:** 5-10 critical scenarios  

**Critical Paths:**
1. Register → Login → Create Org → Create Todo → Logout
2. Login → Update Todo (with conflict) → Resolve → Success
3. OrgAdmin → Add Member → Member creates todo → Admin views audit
4. Export todos → Import todos → Verify count
5. Soft delete → Restore → Verify visibility

---

## Test Coverage Goals

| Layer | Target | Current |
|-------|--------|---------|
| Domain | 90% | TBD |
| Application | 80% | TBD |
| Infrastructure | 70% | TBD |
| API | 60% | TBD |
| **Overall** | **80%** | **TBD** |

---

## Test Data Strategy

**Builders Pattern:**
```csharp
public class TodoItemBuilder
{
    private string _title = "Default Title";
    private Priority _priority = Priority.Medium;
    
    public TodoItemBuilder WithTitle(string title) 
    {
        _title = title;
        return this;
    }
    
    public TodoItem Build() => TodoItem.Create(..., _title, ..., _priority, ...);
}

// Usage
var todo = new TodoItemBuilder()
    .WithTitle("Important Task")
    .WithPriority(Priority.High)
    .Build();
```

---

## Continuous Testing

**Pre-Commit:**
- Run unit tests locally
- Linting (dotnet format)

**CI Pipeline:**
- All unit tests
- All integration tests
- Code coverage report
- Fail build if coverage < 80%

**Release:**
- Full test suite
- Manual E2E smoke tests
- Security scan (OWASP ZAP)

---

## Test Naming Convention

```
[MethodName]_[Scenario]_[ExpectedBehavior]

Examples:
- CreateTodo_WithValidData_ReturnsTodoWithVersion1
- Login_WithWrongPassword_Returns401
- UpdateTodo_WithStaleVersion_Returns412
```

---

## Assertions Library: FluentAssertions

```csharp
// Instead of:
Assert.Equal(expectedValue, actualValue);

// Use:
actualValue.Should().Be(expectedValue);
result.IsSuccess.Should().BeTrue();
response.StatusCode.Should().Be(HttpStatusCode.Created);
```

---

## Mocking Strategy

**Repositories:** Mock with NSubstitute  
**Services:** Fake implementations (e.g., `FakeDateTimeProvider`)  
**HttpContext:** Use `DefaultHttpContext` in tests

```csharp
var mockRepo = Substitute.For<ITodoRepository>();
mockRepo.GetByIdAsync(Arg.Any<Guid>()).Returns(todo);
```

---

## Test Isolation

- Each test creates own test data
- No shared state between tests
- InMemory database reset between tests
- Use `IClassFixture` for expensive setup

---

## Performance Testing (Future)

**Load Testing:**
- Tool: k6 or Apache JMeter
- Target: 50 concurrent users
- Scenarios: Create todo, List todos, Login

**Benchmarks:**
- Tool: BenchmarkDotNet
- Measure: File write performance, pagination queries

---

## Security Testing

**OWASP ZAP:**
- Run against dev environment
- Check for: SQL injection, XSS, broken auth

**Dependency Scanning:**
- `dotnet list package --vulnerable`
- Fail build on critical vulnerabilities

---

## Test Documentation

Each test should be self-explanatory:
- Clear test name
- Arrange/Act/Assert pattern
- Comments only for complex setup

---

## Definition of Done

A feature is complete when:
- ✅ All acceptance criteria met
- ✅ Unit tests written and passing
- ✅ Integration test for happy path
- ✅ Code coverage ≥ 80% for new code
- ✅ Manual testing completed
- ✅ No regressions in existing tests
