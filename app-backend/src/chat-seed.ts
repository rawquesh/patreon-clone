import { connect, Types } from 'mongoose';
import { config } from 'dotenv';
import { faker } from '@faker-js/faker';

config();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/patreon-clone';
const CHAT_ID = '6813b84b707f22b26e962f44';

async function seedChatMessages() {
  try {
    const connection = await connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Dynamically import the schemas
    const { MessageSchema } = await import('./schemas/chat.schema');
    const { UserSchema } = await import('./schemas/users.schema');
    const { ChatSchema } = await import('./schemas/chat.schema');

    // Register the schemas with mongoose
    const Message = connection.model('Message', MessageSchema);
    const User = connection.model('User', UserSchema);
    const Chat = connection.model('Chat', ChatSchema);

    // Delete existing messages for this chat
    const deleteResult = await Message.deleteMany({ chat: CHAT_ID });
    console.log(
      `Deleted ${deleteResult.deletedCount} existing messages for chat ${CHAT_ID}`,
    );

    // Get the chat to find its participants and creator
    const chat = await Chat.findById(CHAT_ID);
    if (!chat) {
      throw new Error(`Chat with ID ${CHAT_ID} not found`);
    }
    console.log(`Found chat: ${chat.title}`);

    // Get actual participants from the chat
    const participantIds = chat.participants || [];
    const creatorId = chat.creator;

    if (!creatorId) {
      throw new Error('Chat has no creator');
    }

    if (participantIds.length === 0) {
      throw new Error('Chat has no participants');
    }

    // Fetch user details for participants and creator
    const participants = await User.find({
      _id: { $in: participantIds },
    });
    const creator = await User.findById(creatorId);

    if (!creator) {
      throw new Error('Creator not found');
    }

    console.log(
      `Found ${participants.length} participants and creator: ${creator.displayName || creator.email}`,
    );

    // Make sure creator is in the participants list if not already
    const allMessageSenders = [...participants];
    if (
      !participants.some((p) => p._id.toString() === creator._id.toString())
    ) {
      allMessageSenders.push(creator);
    }

    // Generate 50-100 messages for the chat
    const messageCount = Math.floor(Math.random() * 51) + 50; // 50-100 messages
    const messages = [];

    // Get the current date
    const currentDate = new Date();

    // Start date (30 days ago)
    const startDate = new Date();
    startDate.setDate(currentDate.getDate() - 30);

    for (let i = 0; i < messageCount; i++) {
      // Randomly select a sender from the participants
      const sender =
        allMessageSenders[Math.floor(Math.random() * allMessageSenders.length)];

      // Ensure messages are in chronological order
      const createdAt = new Date(
        startDate.getTime() +
          (i / messageCount) * (currentDate.getTime() - startDate.getTime()),
      );

      // Generate message content
      const content = generateMessageContent();

      messages.push({
        chat: new Types.ObjectId(CHAT_ID),
        sender: sender._id,
        content,
        readBy: generateReadByArray(allMessageSenders, sender, i, messageCount),
        createdAt,
        updatedAt: createdAt,
      });
    }

    // Sort messages by createdAt
    messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Save messages to database
    const savedMessages = await Message.insertMany(messages);
    console.log(
      `Successfully created ${savedMessages.length} messages for chat ${CHAT_ID}`,
    );

    // Update the last message field in the chat collection
    const lastMessage = messages[messages.length - 1];
    await Chat.findByIdAndUpdate(CHAT_ID, {
      lastMessage: lastMessage._id,
      updatedAt: lastMessage.createdAt,
    });
    console.log(`Updated lastMessage for chat ${CHAT_ID}`);

    await connection.disconnect();
    console.log('Disconnected from MongoDB');

    return { success: true, count: messages.length };
  } catch (error) {
    console.error('Error seeding chat messages:', error);
    return { success: false, error };
  }
}

// Helper function to generate random message content
function generateMessageContent() {
  const messageTypes = [
    'question',
    'answer',
    'greeting',
    'statement',
    'opinion',
  ];

  const type = messageTypes[Math.floor(Math.random() * messageTypes.length)];

  switch (type) {
    case 'question':
      return faker.helpers.arrayElement([
        'What does everyone think about the upcoming community event?',
        'Has anyone been to the new museum downtown?',
        'When is the next meetup?',
        'What books would you recommend for someone new to the topic?',
        'Can someone explain how this group works?',
        'How do you all manage work-life balance?',
        "What's your favorite recipe to share with friends?",
        'Any recommendations for teaching children about our community values?',
        'Have you seen any good films lately?',
        'How do you balance tradition and modern practices?',
      ]);

    case 'answer':
      return faker.helpers.arrayElement([
        "I think it's about finding balance in our daily lives.",
        'The event is scheduled for next Sunday at the community center.',
        'I really enjoyed reading that book you recommended last month.',
        'In my family, we always gather for a special meal on special occasions.',
        "That's a great question! Let me share my perspective...",
        "According to what I've learned, this practice dates back many generations.",
        'I found an interesting article about this topic, let me share the link.',
        "My grandmother taught me that recipe - it's been in our family for generations.",
        "There's a wonderful explanation in the book we discussed last week.",
        "I've been trying different approaches, happy to discuss further.",
      ]);

    case 'greeting':
      return faker.helpers.arrayElement([
        "Hello everyone! Hope you're having a great day.",
        'Good morning from my side of town!',
        'Greetings to all!',
        'Happy holidays to everyone celebrating!',
        'Hi everyone, just checking in. How is everyone doing?',
        'Good day! Looking forward to our discussion today.',
        'Greetings from downtown! Excited to be part of this community.',
        'Hello friends! What a beautiful day for learning together.',
        'Hope everyone had a peaceful weekend.',
        'Good evening everyone, great to connect with you all.',
      ]);

    case 'statement':
      return faker.helpers.arrayElement([
        'I just finished reading a fascinating book on philosophy.',
        'Our community center is hosting a special event next month.',
        'I heard a wonderful talk this weekend.',
        "I found a great recipe I'd like to share with everyone.",
        'My daughter just started learning a new language and she loves it!',
        'The documentary about global communities is now streaming.',
        "I'm planning a trip next summer and would love recommendations.",
        'The new history museum has an amazing exhibit on immigration stories.',
        "I've been learning to play music recently.",
        'Our family just celebrated three generations of traditions together.',
      ]);

    case 'opinion':
      return faker.helpers.arrayElement([
        'I believe building strong community connections is more important than ever.',
        'In my view, learning languages really opens up a deeper understanding of culture.',
        'I think adapting traditions for modern life keeps them meaningful and relevant.',
        'Personally, I find that regular study groups enrich my understanding.',
        'I feel that intergenerational learning creates the strongest foundations.',
        'Supporting each other through challenging times strengthens our community.',
        'I believe food traditions are one of the most accessible ways to connect with our heritage.',
        'In my opinion, digital platforms like this help connect our community.',
        'I think we should focus more on the ethical teachings in our daily lives.',
        'Finding personal meaning in community practices makes them more sustainable.',
      ]);

    default:
      return faker.lorem.sentence();
  }
}

// Helper function to generate readBy array
function generateReadByArray(
  participants,
  sender,
  messageIndex,
  totalMessages,
) {
  const readBy = [sender._id]; // Sender always reads their own message

  // For older messages, more people have likely read them
  // For newer messages, fewer people have read them
  const messageAge = messageIndex / totalMessages; // 0 for oldest, 1 for newest

  participants.forEach((participant) => {
    // Skip the sender as they're already added
    if (participant._id.toString() === sender._id.toString()) {
      return;
    }

    // The older the message, the higher chance someone has read it
    // Newer messages have less chance of being read
    const readChance = 0.9 - messageAge * 0.6; // 90% for oldest, 30% for newest

    if (Math.random() < readChance) {
      readBy.push(participant._id);
    }
  });

  return readBy;
}

seedChatMessages()
  .then((result) => {
    if (result.success) {
      console.log(`Successfully seeded chat with ${result.count} messages`);
      process.exit(0);
    } else {
      console.error('Failed to seed chat messages');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Unhandled error during seeding:', err);
    process.exit(1);
  });
