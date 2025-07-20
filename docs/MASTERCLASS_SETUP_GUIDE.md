# MasterClass Setup Guide - Automatic Conference Details

## 🎯 **How to Create MasterClasses with Automatic Conference Details**

You no longer need to manually add meeting details to descriptions! Here are the best ways to set up MasterClasses with automatic conference integration.

## 🔧 **Method 1: Google Calendar + Google Meet (Recommended)**

### **Step 1: Create Event in Google Calendar**

1. **Open Google Calendar**
2. **Click "Create" or "+"**
3. **Add event title**: Include "MasterClass" in the title
   - Example: "Web Development MasterClass with John Doe"

### **Step 2: Add Google Meet Automatically**

1. **Click "Add Google Meet video conferencing"**
2. **Google automatically generates**:
   - ✅ Meeting link (meet.google.com/xxx-xxx-xxx)
   - ✅ Phone dial-in numbers
   - ✅ Conference ID
3. **No manual description needed!**

### **Step 3: Add MasterClass Details (Optional)**

In the description, you can add:

```
Instructor: John Doe
Max: 50

Learn advanced React patterns and best practices in this interactive session.
```

### **What Happens Automatically:**

- ✅ **Meeting Link**: Extracted from Google Meet integration
- ✅ **Conference Type**: Shows "Google Meet Meeting"
- ✅ **Join Button**: Direct link to Google Meet
- ✅ **Clean Description**: Only shows the actual content

## 🔧 **Method 2: External Meeting Platforms**

### **For Zoom Meetings:**

1. **Create event in Google Calendar**
2. **In the Location field**, add your Zoom link:
   ```
   https://zoom.us/j/123456789
   ```
3. **Or add to description**:

   ```
   Instructor: Jane Smith
   Max: 30
   https://zoom.us/j/987654321

   Deep dive into machine learning fundamentals.
   ```

### **For Microsoft Teams:**

1. **Add Teams link to Location or Description**:
   ```
   https://teams.microsoft.com/l/meetup-join/...
   ```

### **Supported Platforms:**

- ✅ **Google Meet** (automatic detection)
- ✅ **Zoom** (zoom.us links)
- ✅ **Microsoft Teams** (teams.microsoft.com)
- ✅ **Webex** (webex.com)
- ✅ **GoToMeeting** (gotomeeting.com)
- ✅ **BlueJeans** (bluejeans.com)

## 📋 **Best Practices for MasterClass Events**

### **1. Event Title Format**

```
[Topic] MasterClass with [Instructor Name]
```

Examples:

- "Digital Marketing MasterClass with Sarah Johnson"
- "Public Speaking MasterClass with Mike Chen"
- "React Development MasterClass"

### **2. Description Format**

#### **For Free MasterClasses:**

```
Instructor: [Name]
Max: [Number]
Free
Register: [Optional registration link]

[Actual description of the masterclass content]
```

#### **For Premium MasterClasses:**

```
Instructor: [Name]
Max: [Number]
Price: KES 2000
Premium

[Actual description of the masterclass content]
```

#### **Alternative Pricing Formats:**

```
Price: $50.00
Price: USD 50
Price: Ksh 2000
2000 KES
$25
```

### **3. Timing**

- **Duration**: 60-90 minutes typical
- **Buffer**: Add 15 minutes before/after for setup
- **Time Zone**: Use your local time zone

### **4. Attendee Management**

- **Set capacity** in description: "Max: 50"
- **Use Google Calendar guests** for tracking
- **Enable "Guests can invite others"** if desired

## 🎨 **How It Appears in Your App**

### **MasterClass Cards Show:**

- ✅ **Conference Type**: "Google Meet Meeting", "Zoom Meeting", etc.
- ✅ **Online Indicator**: Clear visual indication
- ✅ **Clean Description**: No HTML or metadata clutter
- ✅ **Status**: Live, Upcoming, or Completed

### **Detail Pages Show:**

- ✅ **Meeting Platform**: "Online (Google Meet)"
- ✅ **Join Button**: Direct link when live
- ✅ **Registration Info**: If registration link provided
- ✅ **Full Details**: Instructor, capacity, timing

## 🔄 **Automatic Data Extraction**

The system automatically extracts:

### **From Google Calendar Conference Data:**

- Meeting links (Google Meet)
- Conference type
- Entry points (video, phone)

### **From Description/Location:**

- Instructor name (looks for "Instructor: Name")
- Capacity (looks for "Max: 50", "Limit: 30", "Capacity: 25")
- Registration links (looks for "Register: URL")
- Meeting links (Zoom, Teams, etc.)

### **Smart Cleaning:**

- Removes HTML tags (`<br>`, `<a>`, etc.)
- Strips metadata from description
- Preserves actual content
- Handles HTML entities

## 🧪 **Testing Your Setup**

### **1. Create Test Event**

```
Title: Test MasterClass with John Doe
Time: [Future date/time]
Add Google Meet: ✅
Description:
Instructor: John Doe
Max: 25

This is a test masterclass event to verify the integration.
```

### **2. Check Your App**

1. **Home page** should show the MasterClass card
2. **Card should display**: "Google Meet Meeting"
3. **Click card** to see detail page
4. **Detail page should show**: Meeting platform info

### **3. Verify Data**

- ✅ Clean description (no HTML)
- ✅ Instructor name extracted
- ✅ Meeting type detected
- ✅ Join button available

## 🚨 **Troubleshooting**

### **Meeting Link Not Detected:**

- ✅ Check Google Calendar API permissions
- ✅ Ensure "Add Google Meet" was clicked
- ✅ Verify link format in description/location

### **Description Still Shows HTML:**

- ✅ Check if description cleaning is working
- ✅ Verify FormattedDescription component is used
- ✅ Test with simple description first

### **Conference Type Shows "Online Meeting":**

- ✅ URL might not match known patterns
- ✅ Add URL to `detectConferenceType` function
- ✅ Check if URL is properly formatted

## 🎉 **Result**

With this setup, you can:

- ✅ **Create events normally** in Google Calendar
- ✅ **Add Google Meet automatically** with one click
- ✅ **See professional cards** in your app
- ✅ **No manual HTML editing** required
- ✅ **Automatic meeting detection** works perfectly

## 💰 **Premium MasterClasses (NEW!)**

### **How Premium MasterClasses Work:**

#### **Free MasterClasses:**

- ✅ **Open to everyone**
- ✅ **Direct registration** via external links
- ✅ **Immediate access** to meeting links
- ✅ **No payment required**

#### **Premium MasterClasses:**

- 🔒 **Payment required** for access
- 💳 **IntaSend (M-Pesa) and Stripe** payment options
- 🎯 **Enrollment tracking** in Sanity CMS
- 🔐 **Meeting links protected** until payment
- 📊 **Revenue tracking** and analytics

### **Setting Up Premium MasterClasses:**

#### **1. Create Premium Event**

```
Title: Advanced React Patterns MasterClass with Sarah Johnson
Description:
Instructor: Sarah Johnson
Max: 30
Price: KES 3000
Premium

Master advanced React patterns including render props, compound components, and custom hooks. This exclusive session includes hands-on coding exercises and Q&A.
```

#### **2. What Happens Automatically:**

- ✅ **Price displayed** on cards (KES 3,000)
- ✅ **Lock icon** indicates premium content
- ✅ **Enroll button** starts payment process
- ✅ **Meeting access** granted after payment
- ✅ **Enrollment tracked** in database

#### **3. Payment Flow:**

1. **User clicks "Enroll with M-Pesa"**
2. **Payment processed** via IntaSend/Stripe
3. **Enrollment created** in Sanity
4. **Access granted** to meeting link
5. **User can join** when session is live

### **Pricing Examples:**

| Format            | Result               |
| ----------------- | -------------------- |
| `Price: KES 2000` | KES 2,000 (IntaSend) |
| `Price: $50.00`   | $50.00 (Stripe)      |
| `Price: USD 25`   | $25.00 (Stripe)      |
| `Free`            | Free access          |
| `Premium`         | Premium (price TBD)  |

### **Revenue Tracking:**

Premium MasterClasses automatically track:

- ✅ **Enrollment numbers**
- ✅ **Revenue per session**
- ✅ **Payment methods used**
- ✅ **Attendance rates**
- ✅ **Student engagement**

## 📧 **Google Calendar Invites (NEW!)**

### **Automatic Invite System:**

After payment completion, the system automatically:

- ✅ **Sends Google Calendar invite** to the enrolled student
- ✅ **Adds user as attendee** to the original MasterClass event
- ✅ **Includes meeting link** and all event details
- ✅ **Enables automatic reminders** via Google Calendar
- ✅ **Prevents duplicate invites** for the same user

### **Required Environment Variables:**

Add these to your `.env.local` file:

```env
# Google Calendar API (for invites)
GOOGLE_PROJECT_ID=your-google-project-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=calendar-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CALENDAR_ID=primary
```

### **Setup Steps:**

1. **Create Google Cloud Project** (if not already done)
2. **Enable Calendar API** in Google Cloud Console
3. **Create Service Account** with Calendar permissions
4. **Download service account key** and extract credentials
5. **Share your calendar** with the service account email
6. **Add environment variables** to your `.env.local`

### **User Experience:**

1. **User completes payment** → Redirected with success message
2. **System processes enrollment** → Creates record in Sanity
3. **Google invite sent** → User receives email within 1-2 minutes
4. **User accepts invite** → Event appears in their Google Calendar
5. **Automatic reminders** → Google sends notifications before event
6. **Easy access** → User clicks meeting link directly from calendar

### **Admin Functions:**

#### **Manual Invite Sending:**

```bash
# Send invite to specific user
POST /api/admin/send-masterclass-invite
{
  "masterclassId": "event-id",
  "email": "student@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### **Bulk Invite Sending:**

```bash
# Send invites to all enrolled students
GET /api/admin/send-masterclass-invite?masterclassId=event-id
```

**Your MasterClass system now provides a complete end-to-end experience from payment to calendar integration!** 🚀💰📧
