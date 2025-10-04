# WOD Nation - CrossFit Competition Schedule

A static web page to display and manage CrossFit competition event schedules. Designed with a mobile-first approach for athletes and spectators to easily view event details on their phones.

## Features

- **Responsive Table View**: Displays schedule time, team name, arena, and lane information
- **Detailed Event Modal**: Click any event to view complete details including:
  - Team members
  - Category
  - Start and end times
  - Duration
  - WOD (Workout of the Day) exercises
- **Mobile-First Design**: Optimized for mobile devices with a clean, minimalist interface
- **Auto-Deploy**: GitHub Actions workflow automatically deploys to GitHub Pages

## Project Structure

```
wodNation/
├── index.html          # Main HTML file
├── styles.css          # CSS styles (mobile-first, responsive)
├── app.js              # JavaScript to load and display events
├── events.json         # Event data source
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions workflow
└── README.md           # This file
```

## Setup Instructions

### 1. Add Your Event Data

Edit `events.json` to add your competition events. Follow this structure:

```json
{
  "events": [
    {
      "scheduleTime": "2025-01-15T08:00:00Z",
      "teamName": "Team Name",
      "arena": "Arena A",
      "lane": "Lane 1",
      "details": {
        "teamMembers": ["Athlete 1", "Athlete 2"],
        "category": "RX Mixed",
        "duration": 15,
        "WOD": "For Time:\n21-15-9\n- Exercise 1\n- Exercise 2"
      }
    }
  ]
}
```

### 2. Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to your repository Settings → Pages
3. Under "Build and deployment", select "GitHub Actions" as the source
4. Push to the `main` branch to trigger automatic deployment

The GitHub Actions workflow will automatically deploy your site whenever you push changes to the main branch.

## Local Development

To test locally, you'll need to run a local web server (due to CORS restrictions when loading JSON files):

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Mobile-first responsive design with flexbox
- **Vanilla JavaScript**: No frameworks or dependencies
- **GitHub Actions**: Automated deployment to GitHub Pages

## Browser Support

Works on all modern browsers including:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - feel free to use this for your CrossFit competitions!

