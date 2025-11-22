# Nexus HR - دليل Agents Architecture

هذا الملف يوضح هيكل ملفات agents.md في المشروع وموقع كل ملف.

## ملفات Agents.md المُنشأة

تم إنشاء ملفات agents.md التالية لمساعدة الـ AI agents على فهم معمارية المشروع:

### 1. Root Level
- ✅ `/agents.md` - خريطة معمارية شاملة للمشروع

### 2. Backend (Server)
- ✅ `/server/agents.md` - Backend API module overview

### Server Sub-modules (تحتاج للإنشاء)
- ⏳ `/server/src/routes/agents.md` - API Routes definitions
- ⏳ `/server/src/controllers/agents.md` - Business logic controllers
- ⏳ `/server/src/middleware/agents.md` - Authentication & validation middleware
- ⏳ `/server/prisma/agents.md` - Database schema & migrations

### 3. Frontend (src/)
- ⏳ `/src/agents.md` - Frontend application overview

### Frontend Sub-modules (تحتاج للإنشاء)
- ⏳ `/src/components/agents.md` - UI component library
- ⏳ `/src/services/agents.md` - API client services
- ⏳ `/src/pages/agents.md` - Application pages/routes

### 4. Infrastructure
- ⏳ `/k8s/agents.md` - Kubernetes deployment
- ⏳ `/docs/agents.md` - Documentation center

## محتوى الملفات

تم تصميم كل ملف agents.md بنفس البنية الموحدة التي تحتوي على 8 أقسام:

1. **Purpose** - الغرض من الـ module
2. **Owned Scope** - المسؤوليات والملفات المملوكة
3. **Key Files & Entry Points** - أهم الملفات ونقاط الدخول
4. **Dependencies & Interfaces** - الاعتماديات والواجهات
5. **Local Rules / Patterns** - القواعد والأنماط المحلية
6. **How to Run / Test** - كيفية التشغيل والاختبار
7. **Common Tasks for Agents** - المهام الشائعة
8. **Notes / Gotchas** - ملاحظات ومشاكل شائعة

## كيفية استخدام هذه الملفات

### للـ AI Agents:
1. ابدأ بقراءة `/agents.md` للحصول على نظرة عامة
2. راجع "Agent Map" في النهاية لمعرفة الـ modules المتاحة
3. اقرأ agents.md الخاص بالـ module الذي تعمل عليه
4. استخدم "Common Tasks" كدليل للعمليات الشائعة

### للمطورين:
- استخدم agents.md كمرجع سريع لفهم أي module
- راجع "How to Run / Test" للبدء السريع
- تحقق من "Notes / Gotchas" قبل مواجهة المشاكل
- استخدم "Common Tasks" كـ cookbook للعمليات الشائعة

## إنشاء الملفات المتبقية

الملفات التالية تحتوي على المحتوى الكامل ولكن لم يتم كتابتها بعد للملف النظامي:

1. server/src/routes/agents.md
2. server/src/controllers/agents.md
3. server/src/middleware/agents.md
4. server/prisma/agents.md
5. src/agents.md
6. src/components/agents.md
7. src/services/agents.md
8. src/pages/agents.md
9. k8s/agents.md
10. docs/agents.md

يمكن إنشاء هذه الملفات من خلال المحتوى المُقدَّم في الـ conversation السابقة.

## هيكل شجرة المشروع

```
nexus-hr/
├── agents.md                           ✅ خريطة معمارية شاملة
├── AGENTS_GUIDE.md                     ✅ هذا الملف
├── server/
│   ├── agents.md                       ✅ Backend API module
│   ├── src/
│   │   ├── routes/agents.md           ⏳ API Routes
│   │   ├── controllers/agents.md      ⏳ Controllers
│   │   └── middleware/agents.md       ⏳ Middleware
│   └── prisma/agents.md               ⏳ Database
├── src/
│   ├── agents.md                       ⏳ Frontend app
│   ├── components/agents.md           ⏳ UI Components
│   ├── services/agents.md             ⏳ API Services
│   └── pages/agents.md                ⏳ Pages
├── k8s/
│   └── agents.md                       ⏳ K8s deployment
└── docs/
    └── agents.md                       ⏳ Documentation
```

## الخطوات التالية

1. ✅ تم إنشاء الملفات الأساسية (root وserver)
2. ⏳ إنشاء الملفات المتبقية (10 ملفات)
3. ⏳ Commit وpush جميع الملفات
4. ⏳ اختبار الملفات مع AI agents

## المعلومات التقنية

- **اللغة**: عربي مع مصطلحات تقنية بالإنجليزية
- **الصيغة**: Markdown
- **البنية**: 8 أقسام موحدة
- **الجمهور المستهدف**: AI agents والمطورين

---

**ملاحظة**: هذا الملف هو دليل إرشادي. الملفات الفعلية agents.md تحتوي على التفاصيل الكاملة لكل module.
