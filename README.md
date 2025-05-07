# X Trends - Twitter Discourse Tracker

A journalist-facing web application that tracks trending discourse on Twitter (X). This tool helps journalists monitor and visualize how frequently specific topics or keywords are mentioned over time, making it easier to spot emerging narratives and trends.

## 🚀 Features

- **Topic Management**
  - Create and define custom topics with relevant keywords
  - Edit existing topics to refine your tracking
  - Delete topics that are no longer relevant
  - Organize multiple topics simultaneously

- **Data Visualization**
  - Interactive line and bar charts showing mention frequency over time
  - Toggle between different visualization types
  - Hover for detailed information at specific points in time

- **Trend Analysis**
  - Total mentions statistics
  - Average daily mentions
  - Peak mention detection
  - Trend direction indicators (up/down)
  - Time-series data presentation

- **User Experience**
  - Clean, professional interface
  - Responsive design for all device sizes
  - Real-time data refreshing
  - Intuitive topic management

## 🛠️ Technical Architecture

### Backend (FastAPI)

The backend is built with FastAPI, providing a high-performance API for the frontend to interact with. It includes:

- RESTful API endpoints for topic management
- Data processing and trend analysis
- Mock data generation for development (when Twitter API credentials are not provided)
- Twitter API integration capability

### Frontend (React)

The frontend is built with React and modern web technologies:

- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for UI components
- Recharts for data visualization
- Responsive design principles

## 📊 Data Flow

1. User creates or selects a topic with keywords
2. Application fetches Twitter data related to those keywords
3. Data is processed to extract mention frequency over time
4. Trend analysis is performed to identify patterns
5. Results are visualized through interactive charts

## 🔧 Setup & Installation

### Prerequisites

- Node.js (v16+)
- Python (v3.10+)
- Poetry (Python dependency management)
- Twitter API credentials (optional, mock data is used if not provided)

### Backend Setup

```bash
cd twitter-discourse-tracker/backend
poetry install
poetry run uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd twitter-discourse-tracker/frontend
npm install
npm run dev
```

### Environment Configuration

Create a `.env` file in the backend directory with your Twitter API credentials:

```
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

## 🔍 Usage Guide

1. **Create a Topic**
   - Enter a descriptive name (e.g., "Climate Change")
   - Add relevant keywords (e.g., "global warming", "climate crisis")
   - Click "Create Topic"

2. **View Trends**
   - Select a topic from your list
   - Click "View Trends" to see visualization
   - Toggle between line and bar charts
   - Analyze statistics in the dashboard

3. **Refresh Data**
   - Click "Refresh Data" on any topic to update with latest mentions
   - View updated trends and statistics

## 🔮 Future Enhancements

- Sentiment analysis for tracked topics
- Real-time data streaming
- Export capabilities for reports
- Advanced filtering options
- Historical data comparison
- User authentication and saved preferences

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

For questions or feedback, please open an issue in the repository.
