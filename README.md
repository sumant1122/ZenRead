# ZenRead 🍃

**ZenRead** is a distraction-free web application designed to improve your online reading experience. It transforms cluttered blog posts and articles into a clean, focused "Reader View," while offering tools to track your reading progress and manage your reading list.

![ZenRead](https://placeholder-image-url-if-available.com) *Note: Replace with a screenshot of the app*

## 🎯 What is it useful for?

We often find interesting articles but get distracted by ads, pop-ups, and cluttered layouts. ZenRead solves this by:

*   **Focus:** Stripping away unrelated content (ads, sidebars, navigation) to present just the text.
*   **Progress Tracking:** Providing a visual progress bar and percentage indicator that tracks how much you've read.
*   **Time Management:** estimating reading time before you start, helping you decide if you have time to read it now or save it for later.
*   **Library Management:** Automatically saving your reading history and progress, so you can pick up exactly where you left off on any article.

## ✨ Key Features

*   **Distraction-Free Reader:** Parses URLs to extract and display only the main article content.
*   **Live Progress Tracking:** A sticky stats bar updates your reading percentage in real-time as you scroll.
*   **Smart History:** Automatically saves visited links, word counts, and your last scroll position to `localStorage`.
*   **Responsive Design:** A fully responsive layout with a collapsible sidebar for mobile reading.
*   **Zen Aesthetic:** A calming, nature-inspired UI designed to reduce eye strain and anxiety.

## 🛠️ Tech Stack

*   **Frontend:** [Next.js 15](https://nextjs.org/) (React, App Router), TypeScript
*   **Styling:** [Bootstrap 5](https://getbootstrap.com/), Custom CSS
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Backend:** Next.js API Routes
*   **Scraping:** [Cheerio](https://cheerio.js.org/) (for HTML parsing)
*   **HTTP Client:** Axios

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/zenread.git
    cd zenread
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

## ⚠️ Current Shortcomings

While ZenRead is functional, it has some limitations due to its heuristic parsing approach:

*   **Parsing Accuracy:** It relies on common HTML structures (`<article>`, `<main>`, `h1`) to find content. It may fail to correctly extract text from complex or heavily JavaScript-rendered websites (SPAs).
*   **Image Handling:** Currently, it extracts text but may not perfectly preserve inline images or formatting from the original article.
*   **No Paywall Bypass:** It acts as a standard web client; it cannot and will not access content behind paywalls or authentication.
*   **Local Storage Only:** Reading history is stored in the browser. If you clear your cache or switch devices, your history is lost.

## 🔮 Future Improvements

Here are some ideas for taking ZenRead to the next level:

*   **Enhanced Parsing:** Integrate a more robust parser (like Mozilla's Readability.js) to handle a wider variety of website layouts and preserve images better.
*   **Cloud Sync:** Implement a real backend (Supabase/Firebase/Postgres) to sync reading history across devices with user authentication.
*   **Custom Themes:** Allow users to toggle between "Light", "Dark", and "Sepia" modes for different lighting conditions.
*   **Offline Support:** Cache article content so you can read saved articles without an internet connection (PWA).
*   **Tagging/Categories:** Allow users to organize their reading history into folders or tags (e.g., "Tech", "Cooking", "News").

---

Enjoy your reading! 🍃