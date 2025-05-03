# AI Chat Database Application

<img width="379" alt="image" src="https://github.com/user-attachments/assets/4a811c69-e5f3-49c3-b7fa-900212cc7ffd" />


This is a [Next.js](https://nextjs.org) application that provides an interface for visualizing and querying Philippine earthquake data.

## Prerequisites

- Node.js (v18 or newer)
- pnpm package manager
- Git

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ai-chat-db
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration details.

## Dataset Setup

1. Download the earthquake dataset from Kaggle:
   - Visit [Philippine Earthquakes from PHIVOLCS](https://www.kaggle.com/datasets/bwandowando/philippine-earthquakes-from-phivolcs)
   - You may need to create a Kaggle account if you don't have one
   - Download the dataset as CSV

2. Save the dataset:
   - Save the downloaded CSV file as `phivolcs_earthquake_data.csv`
   - Place it in the `/data` directory of the project:

```bash
mkdir -p data
mv /path/to/downloaded/file.csv ./data/phivolcs_earthquake_data.csv
```

## Database Seeding

Seed the database with earthquake data:

```bash
pnpm run seed
```

## Running the Application

Start the development server:

```bash
pnpm dev
```

Access the application in your browser:
   - Open [http://localhost:3000](http://localhost:3000)


## For production builds:

```bash
pnpm build
pnpm start
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
