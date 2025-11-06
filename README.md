# Discord Message Scraper

A Node.js application that scrapes Discord messages from specified channels using Puppeteer and publishes them to RabbitMQ for further processing.

## Features

- **Automated Discord Login**: Logs into Discord using provided credentials
- **Multi-Channel Monitoring**: Monitors multiple Discord channels simultaneously
- **Real-time Message Scraping**: Uses mutation observers to detect new messages
- **Message Queue Integration**: Publishes scraped messages to RabbitMQ
- **Headless Operation**: Can run in headless mode for server deployment
- **User Data Persistence**: Maintains browser profiles to avoid repeated logins

## Prerequisites

- Node.js (v14 or higher)
- RabbitMQ server running on localhost
- Discord account credentials
- Access to Discord server and channels you want to monitor

## Installation

1. Clone the repository:
```bash
git clone
cd discord_message
