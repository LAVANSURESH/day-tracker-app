# Day Tracker Journal - Interface Design

## Design Philosophy

The Day Tracker Journal is designed as a clean, distraction-free journaling app that follows **Apple Human Interface Guidelines (HIG)**. The app prioritizes one-handed usage on mobile devices (portrait 9:16) and emphasizes simplicity and accessibility.

---

## Screen List

### 1. **Home Screen (Journal Feed)**
The primary screen showing a chronological list of journal entries. Users can quickly see their recent entries and navigate to create or edit them.

**Content & Functionality:**
- Header with app title and settings icon
- "New Entry" button (prominent, floating or fixed)
- List of journal entries displayed in reverse chronological order (newest first)
- Each entry card shows: date, mood emoji, title/preview text, and time
- Swipe or tap to view full entry
- Pull-to-refresh to reload entries
- Empty state message when no entries exist

### 2. **Entry Detail Screen**
Full view of a single journal entry with the ability to read, edit, or delete.

**Content & Functionality:**
- Header with date and mood selector
- Full entry text displayed in readable format
- Mood indicator (emoji or icon)
- Tags/categories (if applicable)
- Edit button (pencil icon)
- Delete button (trash icon)
- Back button to return to feed
- Share button (optional)

### 3. **Create/Edit Entry Screen**
Form for creating a new journal entry or editing an existing one.

**Content & Functionality:**
- Date picker (defaults to today)
- Mood selector (emoji picker with 5-7 moods: Happy, Sad, Neutral, Anxious, Excited, Grateful)
- Text input field for journal content (multiline, auto-expanding)
- Optional tags/categories input
- Save button (prominent)
- Cancel button
- Auto-save indicator
- Character count (optional)

### 4. **Settings Screen**
User preferences and app configuration.

**Content & Functionality:**
- Theme toggle (Light/Dark mode)
- Notification settings (daily reminder toggle)
- Export data option
- About section
- Privacy/Terms links
- Account settings (if using authentication)

### 5. **Statistics/Insights Screen** (Optional)
Visual summary of journaling habits and mood trends.

**Content & Functionality:**
- Mood distribution chart (pie or bar chart)
- Streak counter (consecutive days journaled)
- Total entries count
- Most common mood
- Weekly/monthly summary

---

## Primary Content and Functionality

### Journal Entry Model
Each entry contains:
- `id`: Unique identifier
- `date`: Date of the entry
- `mood`: Selected mood emoji/icon
- `title`: Optional title or preview
- `content`: Full journal text
- `tags`: Optional array of tags
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Key User Flows

#### Flow 1: Create a New Entry
1. User taps "New Entry" button on Home screen
2. App navigates to Create Entry screen
3. Date is pre-filled with today's date
4. User selects a mood from emoji picker
5. User types journal content in text field
6. User taps "Save"
7. Entry is saved to local storage
8. App returns to Home screen and displays new entry at top

#### Flow 2: View Entry Details
1. User taps an entry card on Home screen
2. App navigates to Entry Detail screen
3. Full entry content is displayed
4. User can tap "Edit" to modify or "Delete" to remove
5. User taps back to return to Home screen

#### Flow 3: Edit Existing Entry
1. User views an entry and taps "Edit"
2. App navigates to Edit Entry screen with pre-filled data
3. User modifies mood, content, or tags
4. User taps "Save"
5. Entry is updated in storage
6. App returns to Entry Detail or Home screen

#### Flow 4: View Statistics
1. User taps "Statistics" tab (if included)
2. App displays mood trends, streaks, and insights
3. User can view weekly or monthly summaries
4. User can return to Home or Settings

---

## Color Choices

The app uses a calming, journal-inspired color palette suitable for reflective content:

| Element | Light Mode | Dark Mode | Purpose |
|---------|-----------|-----------|---------|
| **Primary** | `#4A90E2` (Soft Blue) | `#5BA3F5` (Bright Blue) | Buttons, accents, highlights |
| **Background** | `#FFFFFF` (White) | `#0F0F0F` (Deep Black) | Main screen background |
| **Surface** | `#F5F7FA` (Light Gray) | `#1A1A1A` (Dark Gray) | Cards, input fields |
| **Foreground** | `#1A1A1A` (Dark Gray) | `#FFFFFF` (White) | Primary text |
| **Muted** | `#8A92A0` (Medium Gray) | `#A0A8B8` (Light Gray) | Secondary text, hints |
| **Border** | `#E0E4E8` (Light Border) | `#333333` (Dark Border) | Dividers, card borders |
| **Success** | `#4CAF50` (Green) | `#66BB6A` (Light Green) | Confirmations, saved state |
| **Warning** | `#FF9800` (Orange) | `#FFB74D` (Light Orange) | Cautions, alerts |
| **Error** | `#F44336` (Red) | `#EF5350` (Light Red) | Errors, delete actions |

### Mood Emoji Colors (for visual distinction)
- 😊 Happy: `#FFD700` (Gold)
- 😢 Sad: `#87CEEB` (Sky Blue)
- 😐 Neutral: `#A9A9A9` (Gray)
- 😰 Anxious: `#FF6B6B` (Red)
- 🤩 Excited: `#FF1493` (Deep Pink)
- 🙏 Grateful: `#90EE90` (Light Green)

---

## Typography

- **Headings**: San Francisco (iOS) / Roboto (Android) - Bold, 24-28px
- **Body Text**: San Francisco (iOS) / Roboto (Android) - Regular, 16-18px
- **Captions**: San Francisco (iOS) / Roboto (Android) - Regular, 12-14px
- **Line Height**: 1.5× for body text, 1.2× for headings

---

## Interaction Patterns

### Button Feedback
- Primary buttons: Scale to 0.97 on press, light haptic feedback
- Secondary buttons: Opacity change to 0.7 on press
- Destructive buttons (Delete): Red color, confirmation dialog

### List Interactions
- Swipe to reveal actions (edit/delete) on entry cards
- Long press for quick actions
- Tap to navigate to detail view

### Input Feedback
- Text field focus: Border color changes to primary
- Character count updates in real-time
- Auto-save indicator shows "Saving..." then "Saved"

### Navigation
- Tab bar at bottom for main sections (Home, Statistics, Settings)
- Smooth transitions between screens
- Back button on detail/edit screens

---

## Accessibility Considerations

- All interactive elements have minimum 44px tap targets
- Color is not the only indicator (use icons + text)
- Text has sufficient contrast ratio (4.5:1 minimum)
- Support for VoiceOver/TalkBack
- Readable font sizes (minimum 16px for body text)
- Clear, descriptive labels for all inputs and buttons

---

## Layout Specifications

### Safe Area Handling
- All content respects safe area (notch, home indicator)
- Use `ScreenContainer` component for proper padding
- Tab bar positioned at bottom with safe area inset

### Spacing
- Padding: 16px (standard), 8px (compact), 24px (generous)
- Gap between elements: 12px (standard), 8px (compact)
- Card border radius: 12px

### List Item Height
- Entry card: ~80-100px (with preview text)
- Mood selector button: 56px
- Standard button: 48-56px

---

## Performance Considerations

- Use `FlatList` for entry list (never `ScrollView` with `.map()`)
- Lazy load images if added in future
- Debounce auto-save to avoid excessive writes
- Paginate entries if list grows large (100+ entries)

---

## Future Enhancements (Not in MVP)

- Photo/media attachment support
- Voice-to-text journaling
- Search and filter entries
- Reminders and notifications
- Export to PDF or email
- Cloud sync and multi-device support
- Collaborative journaling (shared entries)
- AI-powered mood insights
