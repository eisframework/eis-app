# Panduan Lengkap Menggunakan Semua Agent

## Overview

EIS Framework memiliki 3 agent yang bekerja sama untuk membangun aplikasi dengan kualitas tinggi:

1. **INIT_AGENT** - Memulai project baru
2. **TASK_AGENT** - Implementasi fitur
3. **MANAGER_AGENT** - Manajemen perubahan dan release notes

**Note:** Testing dan deployment manual. Referensi:
- `docs/TESTING.md` - Panduan menulis test (unit, integration)
- `README.md` - Panduan deployment ke production

---

## 1. INIT_AGENT - Memulai Project Baru

### Kapan Menggunakan?

Gunakan **INIT_AGENT** saat:
- Memulai project EIS baru
- Setup infrastructure awal
- Inisialisasi database

### Workflow

```bash
# 1. Mention INIT_AGENT
"Hai @workflow/INIT_AGENT.md, yuk kita mulai project baru"

# 2. Ikuti step-by-step:
# - Setup environment variables (.env)
# - Run database migrations
# - Setup design system
# - Buat layout components
# - Customize auth pages
# - Start dev server

# 3. Setelah selesai:
# Tutup session ini
# Buka session baru dengan: "Hai @workflow/TASK_AGENT.md yuk kita kerja"
```

### Output

- Project infrastructure siap
- Database ter-setup (SQLite + Drizzle ORM)
- Dev server berjalan di http://localhost:3000

---

## 2. TASK_AGENT - Implementasi Fitur

### Kapan Menggunakan?

Gunakan **TASK_AGENT** saat:
- Ingin implementasi fitur baru
- Ingin modifikasi fitur yang ada
- Ingin fix bug
- Selesai dengan INIT_AGENT

### Workflow

```bash
# 1. Mention TASK_AGENT
"Hai @workflow/TASK_AGENT.md, yuk kita kerja"

# 2. TASK_AGENT akan:
# - Baca PROGRESS.md untuk lihat task pending
# - Tampilkan top 3 tasks dengan priority [HIGH], [MEDIUM], [LOW]
# - Tanya mau kerja task apa

# 3. Pilih task dan implementasi:
# - Buat/modify controller (backend/controllers/)
# - Buat/modify page (frontend/pages/)
# - Tambah route (backend/routes/web/)
# - Tambah database schema jika perlu

# 4. Test lokal (opsional tapi recommended):
bun run test:run

# 5. Update PROGRESS.md:
# - Mark task sebagai [x] completed
# - Tambah completion date

# 6. Commit & push:
git add .
git commit -m "feat: add feature"
git push
```

### Best Practices

- ✅ Cek existing files dulu (jangan duplicate)
- ✅ Gunakan built-in controllers/services
- ✅ Match UI kit dari `workflow/ui-kit.html`
- ✅ Test lokal sebelum push
- ✅ Update PROGRESS.md setelah selesai

---

## 3. MANAGER_AGENT - Manajemen Perubahan

### Kapan Menggunakan?

Gunakan **MANAGER_AGENT** saat:
- Menerima change request (bug, feature, modification)
- Perlu update dokumentasi (PRD, TDD, PROGRESS)
- Approve deployment
- Create release notes

### Workflow

```bash
# 1. Receive change request:
# SOURCE: [Client/QA/Developer]
# TYPE: [Bug/Feature/Modification]
# REQUEST: [Deskripsi]

# 2. Analyze impact:
# - Apakah ini critical/high/medium/low priority?
# - Apakah feasible?
# - Apakah out of scope?

# 3. Make decision:
# - Accept → Update dokumentasi
# - Reject → Beri alasan
# - Defer → Simpan untuk nanti

# 4. Update dokumentasi (jika accept):
# - Update PRD.md (requirements, design)
# - Update TDD.md (technical specs)
# - Update PROGRESS.md (tasks)

# 5. Approve deployment:
# - Review test results
# - Update package.json version
# - Create release notes di CHANGELOG.md
```

### Change Request Template

```markdown
SOURCE: [Client/QA/Developer]
TYPE: [Bug/Feature/Modification]

REQUEST:
[Deskripsi singkat]

EXAMPLE:
"Tolong tambah fitur kirim notifikasi WhatsApp ke warga yang belum bayar iuran"
```

### Priority Guidelines

- **Critical** - Security vulnerabilities, data loss, payment errors (immediate action)
- **High** - Important features, major UX issues (next sprint)
- **Medium** - Nice-to-have features, minor improvements (backlog)
- **Low** - Experimental features, low business value (future)

---

## Workflow Lengkap (End-to-End)

### Scenario: Implementasi Fitur Baru

```bash
# STEP 1: Mulai dengan TASK_AGENT
"Hai @workflow/TASK_AGENT.md, yuk kita kerja"

# TASK_AGENT:
- Baca PROGRESS.md
- Tampilkan tasks
- User pilih task
- Implementasi fitur
- Test lokal (bun run test:run)
- Update PROGRESS.md
- Commit & push

# STEP 2: MANAGER_AGENT create release notes
# Update CHANGELOG.md
# Update version di package.json
```

### Scenario: Bug Report dari QA

```bash
# STEP 1: QA lapor bug
SOURCE: QA
TYPE: Bug
ISSUE: "Users can delete users with payment history"

# STEP 2: MANAGER_AGENT analyze
- Priority: Critical (data integrity issue)
- Decision: Accept
- Update PROGRESS.md dengan bug fix task

# STEP 3: TASK_AGENT fix bug
- Implement fix
- Test lokal (bun run test:run)
- Update PROGRESS.md
- Commit & push

# STEP 4: MANAGER_AGENT create release notes
# Update CHANGELOG.md
# Update version di package.json
```

### Scenario: Feature Request dari Client

```bash
# STEP 1: Client request feature
SOURCE: Client
TYPE: Feature Request
REQUEST: "Tolong tambah fitur kirim notifikasi WhatsApp"

# STEP 2: MANAGER_AGENT analyze
- Priority: High (improves collection rates)
- Feasibility: Yes
- Decision: Accept
- Update PRD.md (add feature)
- Update TDD.md (add API specs)
- Update PROGRESS.md (add task)

# STEP 3: TASK_AGENT implement
- Implement feature
- Test lokal (bun run test:run)
- Update PROGRESS.md
- Commit & push

# STEP 4: MANAGER_AGENT create release notes
# Update CHANGELOG.md
# Update version di package.json
```

---

## Scope Enforcement

Each agent has a specific scope and will reject work outside their responsibilities:

### MANAGER_AGENT
**CAN:**
- ✅ Receive and document change requests
- ✅ Analyze impact on PRD, TDD, PROGRESS
- ✅ Update documentation (PRD, TDD, PROGRESS)
- ✅ Approve deployment readiness
- ✅ Update version in package.json
- ✅ Create release notes in CHANGELOG.md

**CANNOT:**
- ❌ Implement features or write code
- ❌ Modify code directly
- ❌ Run tests manually
- ❌ Deploy to production

### TASK_AGENT
**CAN:**
- ✅ Implement features (create/modify pages, controllers, routes, validators)
- ✅ Fix bugs
- ✅ Modify existing features
- ✅ Test locally
- ✅ Update PROGRESS.md

**CANNOT:**
- ❌ Manage changes or update PRD/TDD
- ❌ Create release notes
- ❌ Approve deployment
- ❌ Deploy to production

### INIT_AGENT
**CAN:**
- ✅ Create project infrastructure
- ✅ Setup environment variables
- ✅ Setup database
- ✅ Create documentation (README, PRD, TDD, PROGRESS, ui-kit)
- ✅ Setup design system

**CANNOT:**
- ❌ Implement features or write code
- ❌ Create controllers, pages, routes
- ❌ Manage changes after initialization

**If an agent is asked to do something outside scope:**
```
RESPONSE: "Saya tidak bisa [task]. 
Itu adalah tanggung jawab [CORRECT_AGENT]. 
Silakan mention @[workflow/CORRECT_AGENT.md] untuk [task]."
```

## Quick Reference

### Agent Responsibilities

| Agent | Responsibilities | When Involved |
|-------|----------------|---------------|
| **INIT_AGENT** | Project initialization, setup infrastructure | Memulai project baru |
| **TASK_AGENT** | Implement features, fix bugs | Implementasi fitur |
| **MANAGER_AGENT** | Manage changes, create release notes | Change requests, deployment approval |

**Reference Guides:**
- `docs/TESTING.md` - Panduan menulis test (unit, integration)
- `README.md` - Panduan deployment ke production

### Workflow Commands

```bash
# Start new project
"Hai @workflow/INIT_AGENT.md, yuk kita mulai project baru"

# Implement features
"Hai @workflow/TASK_AGENT.md, yuk kita kerja"

# Manage changes
"Hai @workflow/MANAGER_AGENT.md, ada change request"

# Deploy to production
# Manual deployment after approval
```

### MANAGER_AGENT Usage Examples

**Bug Report:**
```bash
"Hai @workflow/MANAGER_AGENT.md, ada bug report:
SOURCE: QA
TYPE: Bug
ISSUE: Users can delete users with payment history"
```

**Feature Request:**
```bash
"Hai @workflow/MANAGER_AGENT.md, ada feature request:
SOURCE: Client
TYPE: Feature Request
REQUEST: Tolong tambah fitur kirim notifikasi WhatsApp"
```

**Deployment Approval:**
```bash
"Hai @workflow/MANAGER_AGENT.md, tolong approve deployment v1.2.0"
```

**Code Review:**
```bash
"Hai @workflow/MANAGER_AGENT.md, tolong code review:
- Code quality check
- Test coverage review
- Documentation verification
- Deployment readiness approval"
```

### Code Review Checklist

**Code Quality:**
- [ ] No debug code or console.log statements
- [ ] Code follows Laju patterns
- [ ] No security vulnerabilities
- [ ] Proper error handling
- [ ] Clean, readable code

**Testing:**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Test coverage meets goals (70%+)
- [ ] No failing tests

**Documentation:**
- [ ] PROGRESS.md updated
- [ ] README.md up to date
- [ ] Code comments where needed
- [ ] No outdated comments

**Deployment Readiness:**
- [ ] All changes committed
- [ ] Version updated in package.json
- [ ] Release notes ready in CHANGELOG.md

### Important Notes

1. **Testing runs manually** - Use `bun run test:run` to run tests
2. **Deployment manual** - Deploy to production manually after approval
3. **Branching manual** - Create feature branches manually
4. **Release notes by MANAGER_AGENT** - Setelah deployment success

---

## Troubleshooting

### Tests Fail

```bash
# 1. Check test output
# 2. Identify error
# 3. Fix locally
# 4. Re-run tests
bun run test:run
```

### Deployment Fails

```bash
# 1. Check deployment logs
# 2. Fix issue
# 3. Re-deploy
```

---

## Summary

3 Agent EIS Framework bekerja sama untuk membangun aplikasi dengan kualitas tinggi:

1. **INIT_AGENT** - Setup project infrastructure
2. **TASK_AGENT** - Implementasi fitur
3. **MANAGER_AGENT** - Manajemen perubahan

**Workflow:**
```
INIT_AGENT → TASK_AGENT → MANAGER_AGENT
```

**Key Features:**
- ✅ Manual testing (bun run test:run)
- ✅ Manual deployment (after approval)
- ✅ Simplified pre-deployment checklist
- ✅ Industry-standard Git Flow
- ✅ Cocok untuk solo developer

**Best Practices:**
- Gunakan feature branches
- Test lokal sebelum push
- Update PROGRESS.md setelah selesai
- Review release notes
- Follow EIS Framework patterns
