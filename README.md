# 🤖 ChatGPT Clone

A fully functional ChatGPT clone built with Next.js 15, Turbopack, and the AI SDK. This project features a modern UI with bubble chat style, code highlighting, image uploads, and model selection.

![ChatGPT Clone Screenshot](/public/screenshot.png)

## ✨ Features

- **Modern UI** - Bubble chat style with user messages on right (blue) and AI responses on left (green)
- **Real-time streaming** - See AI responses as they're generated
- **Multi-modal chat** - Upload and send images with your messages
- **Code highlighting** - Automatic code detection and syntax highlighting
- **Model selection** - Choose between GPT-4o, GPT-4o mini, GPT-4 Turbo, and GPT-3.5 Turbo
- **Conversation management** - Create, switch between, and delete conversations
- **Mobile responsive** - Works on all device sizes
- **Dark theme** - Easy on the eyes
- **Turbopack** - Lightning fast development experience

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- OpenAI API key

### Installation

1. Clone the repository:

   ```bash
   git clone <https://github.com/ivandj0h/chatgpt-clone.git>

   cd chatgpt-clone
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:

```bash
 OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Running the app

Run the development server with Turbopack:

```bash
npm run dev
```

The app will be available at [http://127.0.0.1:3100](http://127.0.0.1:3100).

## 🛠️ Technologies Used

- **Next.js 15** - React framework with App Router
- **Turbopack** - Fast development experience
- **AI SDK** - For interacting with OpenAI API
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📁 Project Structure

```bash
chatgpt-clone/
├── app/
│ ├── api/
│ │ └── chat/
│ │ └── route.ts # API endpoint for chat
│ ├── globals.css # Global styles
│ ├── layout.tsx # Root layout
│ └── page.tsx # Main chat interface
├── public/
│ └── screenshot.png # App screenshot
├── .env.local # Environment variables (create this)
├── next.config.mjs # Next.js configuration
├── package.json # Dependencies and scripts
├── README.md # This file
└── tailwind.config.ts # Tailwind configuration
```

## 🔑 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

You can get an API key from [OpenAI's platform](https://platform.openai.com/api-keys).

## 🧩 Key Components

- **Bubble Chat UI** - Modern chat interface with bubbles for each message
- **Code Block Rendering** - Automatic detection and rendering of code blocks with syntax highlighting
- **Image Upload** - Support for uploading and sending images
- **Model Selection** - Dropdown to select different OpenAI models
- **Conversation Management** - Sidebar for managing multiple conversations

## 📝 Usage

1. Select a model from the dropdown in the header
2. Type your message in the input box at the bottom
3. Press Enter or click the send button to send your message
4. To upload images, click the paperclip icon and select one or more images
5. To create a new conversation, click "New chat" in the sidebar
6. To switch between conversations, click on them in the sidebar
7. To delete a conversation, hover over it in the sidebar and click the trash icon

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for their amazing API
- [Vercel](https://vercel.com) for Next.js and the AI SDK
- [Tailwind CSS](https://tailwindcss.com) for the styling framework
- [Lucide](https://lucide.dev) for the beautiful icons

---

Built with ❤️ using Next.js 15 and Turbopack
