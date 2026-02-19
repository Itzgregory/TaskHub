# CI/CD Pipeline: TaskHub

**Date:** 2026-02-19  
**Platform:** GitHub Actions  
**Stages:** Build → Test → Security → Deploy  

---

## Pipeline Overview

```
┌─────────┐    ┌─────────┐    ┌──────────┐    ┌────────┐
│  Build  │───▶│  Test   │───▶│ Security │───▶│ Deploy │
│         │    │         │    │          │    │        │
└─────────┘    └─────────┘    └──────────┘    └────────┘
   5 min          10 min          5 min          3 min
```

---

## `.github/workflows/ci.yml`

```yaml
name: TaskHub CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  DOTNET_VERSION: '10.0.x'
  NODE_VERSION: '24.x'

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
        
    - name: Restore dependencies
      run: dotnet restore server/TaskHub.slnx
      
    - name: Build solution
      run: dotnet build server/TaskHub.slnx --configuration Release --no-restore
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-artifacts
        path: server/src/TaskHub.Api/bin/Release/
        
  test:
    name: Test
    needs: build
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
        
    - name: Restore dependencies
      run: dotnet restore server/TaskHub.slnx
      
    - name: Run unit tests
      run: dotnet test server/tests/TaskHub.UnitTests/TaskHub.UnitTests.csproj --logger "trx;LogFileName=unit-tests.trx"
      
    - name: Run integration tests
      run: dotnet test server/tests/TaskHub.IntegrationTests/TaskHub.IntegrationTests.csproj --logger "trx;LogFileName=integration-tests.trx"
      
    - name: Generate coverage report
      run: |
        dotnet test server/TaskHub.slnx \
          --collect:"XPlat Code Coverage" \
          --results-directory ./coverage
        
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v4
      with:
        files: ./coverage/**/coverage.cobertura.xml
        fail_ci_if_error: true
        
    - name: Check coverage threshold
      run: |
        coverage=$(grep -oP 'line-rate="\K[0-9.]+' coverage/**/coverage.cobertura.xml | head -1)
        if (( $(echo "$coverage < 0.80" | bc -l) )); then
          echo "Coverage $coverage is below 80% threshold"
          exit 1
        fi
        
  security:
    name: Security Scan
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
        
    - name: Check for vulnerable packages
      run: |
        dotnet list server/TaskHub.slnx package --vulnerable --include-transitive 2>&1 | tee vulnerable.txt
        if grep -q "has the following vulnerable packages" vulnerable.txt; then
          echo "Vulnerable packages found"
          exit 1
        fi
        
    - name: Run OWASP Dependency Check
      uses: dependency-check/Dependency-Check_Action@main
      with:
        project: 'TaskHub'
        path: './server'
        format: 'HTML'
        
    - name: Upload dependency check results
      uses: actions/upload-artifact@v4
      with:
        name: dependency-check-report
        path: dependency-check-report.html
        
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
        
    - name: Check code formatting
      run: dotnet format server/TaskHub.slnx --verify-no-changes
      
  deploy-dev:
    name: Deploy to Dev
    needs: [test, security, lint]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: development
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: build-artifacts
        
    - name: Deploy to dev server
      run: |
        echo "Deploying to dev environment..."
        # rsync or scp to dev server
        # systemctl restart taskhub-api
        
  deploy-prod:
    name: Deploy to Production
    needs: [test, security, lint]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: build-artifacts
        
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Blue-green deployment script
        # Health check before switching
```

---

## Pipeline Stages Explained

### 1. Build Stage
- Restores NuGet packages
- Compiles solution in Release mode
- Uploads artifacts for deployment

**Success Criteria:**
- Zero build errors
- Zero build warnings (enforced via `.editorconfig`)

---

### 2. Test Stage
- Runs unit tests (Domain + Application)
- Runs integration tests (Infrastructure + API)
- Generates code coverage report
- Fails if coverage < 80%

**Success Criteria:**
- All tests pass
- Code coverage ≥ 80%

---

### 3. Security Stage
- Scans for vulnerable NuGet packages
- Runs OWASP Dependency Check
- Future: SAST with SonarQube

**Success Criteria:**
- Zero critical vulnerabilities
- Zero high vulnerabilities in direct dependencies

---

### 4. Lint Stage
- Checks code formatting (dotnet format)
- Future: Run Roslyn analyzers

**Success Criteria:**
- Code matches style rules

---

### 5. Deploy Stage
**Dev (on push to develop):**
- Automatic deployment
- No manual approval

**Prod (on push to main):**
- Requires manual approval
- Blue-green deployment
- Health check before traffic switch
- Rollback capability

---

## Environment Variables

```yaml
# .env.production (example)
ASPNETCORE_ENVIRONMENT=Production
STORAGE_TYPE=File
STORAGE_PATH=/var/data/taskhub
ARCHIVE_DAYS=90
ARCHIVE_INTERVAL_MINUTES=1440
ALLOWED_HOSTS=api.taskhub.com
CORS_ORIGINS=https://taskhub.com
SESSION_TIMEOUT_HOURS=24
```

---

## Notifications

**Slack Integration:**
```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "🚨 TaskHub CI Failed on ${{ github.ref }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Build failed for <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|Run #${{ github.run_number }}>"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Caching Strategy

```yaml
- name: Cache NuGet packages
  uses: actions/cache@v4
  with:
    path: ~/.nuget/packages
    key: ${{ runner.os }}-nuget-${{ hashFiles('**/*.csproj') }}
    restore-keys: |
      ${{ runner.os }}-nuget-
```

---

## Branch Protection Rules

**Main Branch:**
- Require pull request reviews (1 approver)
- Require status checks to pass (CI)
- Require branches to be up to date
- No direct pushes (except release manager)

**Develop Branch:**
- Require status checks to pass
- Allow direct pushes from maintainers

---

## Release Process

1. Create release branch: `release/v1.0.0`
2. Update version in `.csproj`
3. Update `CHANGELOG.md`
4. Create PR to `main`
5. Merge triggers production deployment
6. Tag release: `git tag v1.0.0`
7. GitHub Release with artifacts

---

## Rollback Procedure

```bash
# SSH to production server
ssh prod-server

# Stop current version
sudo systemctl stop taskhub-api

# Switch symlink to previous version
sudo ln -sfn /opt/taskhub/releases/v1.0.0 /opt/taskhub/current

# Start service
sudo systemctl start taskhub-api

# Verify health
curl https://api.taskhub.com/api/health
```

---

## Monitoring Post-Deployment

- Health check endpoint polling (every 30s)
- Error rate monitoring (Serilog → Seq/Elasticsearch)
- Response time alerting (>1s p99)
- Disk space monitoring (file storage growth)

---

## Cost Optimization

- Use GitHub-hosted runners (free for public repos)
- Cache dependencies
- Parallel test execution
- Skip deploy on docs-only changes
