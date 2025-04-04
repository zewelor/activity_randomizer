# Activity Randomizer

A simple web app that randomly selects an activity from your custom list. No database required - all activities are stored in the URL for easy sharing and bookmarking!

## Features

- Add custom activities or YouTube video URLs
- Randomly select an activity with a click
- Play YouTube videos directly in the app
- Store your activity list in the URL for bookmarking
- Share your activity collection with others via URL
- Responsive design works on desktop and mobile

## How to Use

1. **Add Activities**: Enter text or YouTube URLs in the input field and click "Add Activity"
2. **Get Random Activity**: Click the "Get Random Activity" button to randomly select one
3. **YouTube Videos**: If a YouTube link is selected, the video will play automatically
4. **Save Your List**: Bookmark the page to save your collection
5. **Share with Others**: Use the "Copy Shareable URL" button to share your activity list

## URL Format

All activities are stored in the URL query parameter `activities`. For example:

```
https://yoursite.com/index.html?activities=%5B%22Read%20a%20book%22%2C%22Go%20for%20a%20walk%22%2C%22https%3A%2F%2Fyoutu.be%2FdQw4w9WgXcQ%22%5D
```

This allows you to bookmark different collections of activities or share them with others.

## Local Setup

Simply open the index.html file in your web browser, no server required!
