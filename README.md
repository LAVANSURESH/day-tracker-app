# Day Tracker - AI-Powered Intelligent Journaling App

A mobile app that transforms daily journaling into comprehensive life tracking. Write natural language journal entries, and the app automatically extracts and tracks your exercises, habits, expenses, and activities using AI-powered extraction.

## 🎯 Key Features

### Intelligent Journaling
- **Natural Language Input**: Write freely about your day without structured forms
- **AI-Powered Extraction**: Automatically extract exercises, habits, expenses, and activities from your journal text
- **Confidence Scoring**: Each extracted item has a confidence score (0-1) to ensure accuracy
- **Mood Detection**: AI automatically detects your mood from the journal text

### Multi-Category Tracking
- **Exercises**: Track workouts with type, duration, distance, intensity, and calories
- **Habits**: Create habits with daily/weekly/monthly frequency and track completion streaks
- **Expenses**: Categorize spending across 7 categories (food, transport, entertainment, utilities, health, shopping, other)
- **Activities**: Log important events and milestones with mood tags

### Comprehensive Statistics
- **Mood Trends**: Visualize your emotional patterns over time
- **Spending Analysis**: See total spending, daily average, and category breakdown
- **Habit Streaks**: Track consecutive days of habit completion
- **Workout Metrics**: Monitor total duration, distance, calories, and weekly averages

### User Experience
- **6-Tab Navigation**: Journal, Expenses, Habits, Exercises, Statistics, Settings
- **Dual FAB Buttons**: Quick access to AI-powered journaling (✨) or manual entry (+)
- **Real-Time Preview**: See extracted items before saving
- **Dark Mode Support**: Comfortable viewing in any lighting condition
- **Haptic Feedback**: Tactile feedback on interactions
- **Local Data Storage**: All data persists on device with AsyncStorage

## 🏗️ Architecture

### Frontend
- **Framework**: React Native with Expo SDK 54
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context + AsyncStorage for local persistence
- **Navigation**: Expo Router with tab-based navigation
- **API Client**: tRPC for type-safe backend communication

### Backend
- **Server**: Express.js with tRPC
- **AI Integration**: LLM-powered extraction with JSON schema responses
- **Database**: Optional MySQL with Drizzle ORM (not required for local-only mode)
- **Language Model**: GPT-4o for intelligent text extraction

### Data Models

#### Journal Entry
```typescript
interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: MoodType;
  createdAt: number;
  updatedAt: number;
}
```

#### Extracted Items
```typescript
interface ExtractedExercise {
  type: ExerciseType;
  duration: number; // minutes
  distance?: number; // km
  intensity?: 'light' | 'moderate' | 'high';
  confidence: number; // 0-1
}

interface ExtractedHabit {
  name: string;
  completed: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  confidence: number;
}

interface ExtractedExpense {
  category: ExpenseCategory;
  amount: number;
  description?: string;
  confidence: number;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Expo CLI
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/LAVANSURESH/day-tracker-app.git
cd day-tracker-app

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
```

### Development

```bash
# Start Metro bundler and Expo dev server
pnpm dev:metro

# Start backend server (in another terminal)
pnpm dev:server

# Run on iOS
pnpm ios

# Run on Android
pnpm android

# Run on Web
pnpm dev
```

## 📱 Usage

### Creating a Journal Entry with AI Extraction

1. Tap the ✨ (AI Journal) button on the home screen
2. Write about your day naturally:
   ```
   "Today I went for a 5km run in 30 minutes, felt great! 
    Had lunch at that new cafe ($15), then worked on my meditation 
    habit for 10 minutes. Spent $20 on groceries. Overall feeling 
    excited about my progress!"
   ```
3. Tap "Extract" to see AI-detected items
4. Review the extracted exercises, habits, expenses, and activities
5. Tap "Save Entry & Track Items" to save everything

### Viewing Tracked Items

- **Exercises Tab**: See all logged workouts with metrics
- **Habits Tab**: Track habit completion and streaks
- **Expenses Tab**: Monitor spending by category
- **Statistics Tab**: View comprehensive analytics across all categories

## 🧠 AI Extraction System

The app uses an LLM with JSON schema to extract structured data from unstructured journal text.

### Extraction Process

1. **Text Analysis**: LLM reads your journal entry
2. **Pattern Recognition**: Identifies exercises, habits, expenses, and activities
3. **Confidence Scoring**: Assigns confidence (0-1) to each extraction
4. **Filtering**: Removes low-confidence items (below 0.4)
5. **Structured Output**: Returns JSON with all extracted items

### Example Extraction

**Input Journal:**
```
"Woke up early and did 30 minutes of yoga. Made a smoothie ($8). 
Worked on my reading habit for 45 minutes. Lunch was $12 at Chipotle. 
Went to the gym for an hour of weightlifting. Feeling great today!"
```

**Extracted Items:**
```json
{
  "exercises": [
    { "type": "yoga", "duration": 30, "confidence": 0.95 },
    { "type": "gym", "duration": 60, "confidence": 0.92 }
  ],
  "habits": [
    { "name": "reading", "completed": true, "frequency": "daily", "confidence": 0.88 }
  ],
  "expenses": [
    { "category": "food", "amount": 8, "confidence": 0.9 },
    { "category": "food", "amount": 12, "confidence": 0.92 }
  ],
  "activities": [
    { "type": "activity", "title": "Morning yoga session", "mood": "excited", "confidence": 0.85 }
  ]
}
```

## 📊 Project Structure

```
day-tracker-app/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab-based screens
│   │   ├── index.tsx             # Journal home screen
│   │   ├── expenses.tsx          # Expenses tracker
│   │   ├── habits.tsx            # Habits tracker
│   │   ├── exercises.tsx         # Exercises tracker
│   │   ├── statistics.tsx        # Statistics dashboard
│   │   └── settings.tsx          # App settings
│   ├── create-entry.tsx          # Manual journal entry
│   ├── create-journal-ai.tsx     # AI-powered journal entry
│   ├── create-expense.tsx        # Add expense
│   ├── create-habit.tsx          # Create habit
│   ├── create-exercise.tsx       # Log exercise
│   └── _layout.tsx               # Root layout with providers
├── components/                   # Reusable components
│   ├── screen-container.tsx      # SafeArea wrapper
│   ├── entry-card.tsx            # Journal entry card
│   ├── mood-selector.tsx         # Mood picker
│   └── ui/                       # UI components
├── lib/                          # Utilities and services
│   ├── storage.ts                # Journal storage service
│   ├── expense-storage.ts        # Expense storage service
│   ├── habit-storage.ts          # Habit storage service
│   ├── exercise-storage.ts       # Exercise storage service
│   ├── journal-context.tsx       # State management
│   └── trpc.ts                   # tRPC client
├── server/                       # Backend code
│   ├── extraction.ts             # AI extraction service
│   ├── routers.ts                # tRPC API routes
│   ├── db.ts                     # Database helpers
│   └── _core/                    # Framework code
├── shared/                       # Shared types
│   ├── types.ts                  # Core data types
│   └── extraction-types.ts       # Extraction types
├── tests/                        # Unit tests
│   └── storage.test.ts           # Storage service tests
└── README.md                     # This file
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run specific test file
pnpm test storage.test.ts
```

The app includes 15+ unit tests covering:
- Journal entry CRUD operations
- Data persistence with AsyncStorage
- Statistics calculations
- Error handling and edge cases

## 🔐 Data Privacy

- **Local Storage Only**: All data is stored locally on your device using AsyncStorage
- **No Cloud Sync**: By default, data does not leave your device
- **Optional Backend**: Backend features (cloud sync, user accounts) are optional
- **No Analytics**: The app does not collect usage data

## 🎨 Customization

### Theme Configuration

Edit `theme.config.js` to customize colors:

```javascript
const themeColors = {
  primary: { light: '#0a7ea4', dark: '#0a7ea4' },
  background: { light: '#ffffff', dark: '#151718' },
  // ... more colors
};
```

### App Branding

Update `app.config.ts`:

```typescript
const env = {
  appName: "Your App Name",
  appSlug: "your-app-slug",
  logoUrl: "https://your-logo-url.png",
  // ...
};
```

## 📈 Future Enhancements

- [ ] Cloud sync with user accounts
- [ ] Export data to CSV/PDF
- [ ] Advanced filtering and search
- [ ] Voice-to-text journaling
- [ ] Social sharing of achievements
- [ ] Integration with fitness trackers
- [ ] Recurring expense tracking
- [ ] Goal setting and progress tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ using React Native, Expo, and AI**
