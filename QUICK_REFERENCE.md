# Student Dashboard - Quick Reference

## 🚀 Quick Start

### 1. Start Backend (Terminal 1)
```bash
cd WorldEducation
./mvnw spring-boot:run
```

### 2. Start Frontend (Terminal 2)
```bash
cd world-education-frontend
npm start
```

### 3. Access Application
```
http://localhost:3000
```

### 4. Login
- Username: `student001`
- Password: `student123`

## 📊 Component Architecture

```
StudentDashboard (Main Component)
├── ClassCard[] (Select class)
├── SubjectCard[] (View opted/available subjects)
├── TopicCard[] (View opted/available topics)
├── ContentViewer (View PDFs, images, videos)
└── Navigation (Breadcrumb, Logout)
```

## 🔄 Navigation Flow

```
Login → Classes → Subjects → Topics → Contents → Viewer
         ↑         ↑          ↑         ↑
         └─────────┴──────────┴─────────┘
              (Breadcrumb Navigation)
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/classes` | Get all classes |
| `GET` | `/api/subjects/class/{classId}` | Get subjects for class |
| `GET` | `/api/topics/subject/{subjectId}` | Get topics for subject |
| `GET` | `/api/topics/{topicId}/contents` | Get topic contents |

## 🎨 Component Props

### ClassCard
```javascript
<ClassCard 
  classItem={{classId, className, classNumber, isActive}}
  onClick={() => {}}
/>
```

### SubjectCard
```javascript
<SubjectCard 
  subject={{subjectId, subjectName, classId, isActive}}
  isOpted={true/false}
  onClick={() => {}}
/>
```

### TopicCard
```javascript
<TopicCard 
  topic={{topicId, topicName, publishDate, isActive}}
  isOpted={true/false}
  onClick={() => {}}
/>
```

### ContentViewer
```javascript
<ContentViewer 
  content={{contentId, fileName, fileType, contentDataBase64}}
  onClose={() => {}}
/>
```

## 🎯 Key Features

### ✅ Responsive Grid Layouts
- Desktop: 3-4 columns
- Tablet: 2 columns
- Mobile: 1 column

### ✅ Subscription Status
- **Opted** (Green): User has subscription
- **Available** (Blue): User can subscribe

### ✅ Content Types Supported
- PDF documents
- Images (JPG, PNG, GIF, WEBP)
- Videos (MP4, WEBM, OGG)
- Audio (MP3, WAV)

### ✅ Navigation Features
- Breadcrumb trail
- Back navigation
- Home button
- Logout

## 🔧 Customization

### Change Primary Colors
Edit `StudentDashboard.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change Grid Columns
Edit `StudentDashboard.css`:
```css
.subject-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
```

### Change API Base URL
Edit `config/api.js`:
```javascript
const API_BASE_URL = 'http://your-api-url:8080';
```

## 🐛 Common Issues

### Backend not starting?
```bash
# Clean and rebuild
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend build errors?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### CORS errors?
Check backend `SecurityConfig.java` has proper CORS configuration.

### 401 Unauthorized?
- Token might be expired (24 hours)
- Login again to get new token

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## 🎨 Design Tokens

### Colors
```css
Primary: #667eea → #764ba2 (gradient)
Success: #48bb78
Info: #3182ce
Text Primary: #2d3748
Text Secondary: #718096
Background: #f7fafc
Border: #e2e8f0
```

### Spacing
```css
Small: 8px
Medium: 16px
Large: 24px
XLarge: 40px
```

### Border Radius
```css
Small: 6px
Medium: 12px
Large: 16px
```

## 📊 State Management

```javascript
// Main states in StudentDashboard
activeView: 'classes' | 'subjects' | 'topics' | 'contents'
selectedClass: ClassDTO | null
selectedSubject: SubjectDTO | null
selectedTopic: TopicDTO | null
selectedContent: ContentDTO | null
loading: boolean
error: string | null
```

## 🔒 Protected Routes

All dashboard routes require JWT authentication:
```javascript
Authorization: Bearer {token}
```

Token stored in localStorage:
```javascript
localStorage.getItem('token')
```

## 📝 Testing Checklist

- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000
- [ ] Login successful
- [ ] Classes load correctly
- [ ] Subjects display with subscription status
- [ ] Topics display with subscription status
- [ ] Contents load for subscribed topics
- [ ] Content viewer opens and displays
- [ ] Breadcrumb navigation works
- [ ] Responsive on mobile
- [ ] Logout works

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy build/ folder to hosting service
```

### Backend
```bash
./mvnw clean package
# Deploy target/worldeducation-*.jar
```

---

**Ready to explore! 🎓**
