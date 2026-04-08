import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { connect, Types } from 'mongoose';
import {
  UserSchema,
  AuthProvider,
  CreatorStatus,
  ContentVisibility,
  CreatorCategory,
} from './src/schemas/users.schema';
import { PostSchema, PostType, PostStatus } from './src/schemas/posts.schema';
import { MembershipSchema } from './src/schemas/membersip.schema';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import {
  PostInsightSchema,
  EarningsInsightSchema,
  MembershipInsightSchema,
} from './src/schemas/analytics.schema';
import { faker } from '@faker-js/faker';

config();
const mockUsersData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'mock-users.json'), 'utf8'),
);

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/patreon-clone';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || '',
  },
});
const S3_BUCKET = process.env.S3_PROFILE_BUCKET || 'patreon-clone-assets';

async function uploadFileToS3(filePath: string, key: string): Promise<string> {
  try {
    const fileContent = fs.readFileSync(filePath);

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: getContentType(filePath),
    });

    await s3Client.send(command);
    return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error(`Failed to upload file to S3: ${error.message}`);
    throw error;
  }
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

// Generate random membership tiers
async function generateMembershipTiers(creatorId: string, count: number = 3) {
  const tiers = [];
  const tierNames = [
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Premium',
    'Basic',
    'Standard',
    'Elite',
    'VIP',
  ];
  const benefits = [
    'Exclusive content access',
    'Monthly Q&A sessions',
    'Private community access',
    'Behind-the-scenes content',
    'Early access to new content',
    'Personal messages',
    'Join live streams',
    'Download all resources',
    'Monthly mentoring call',
    'Request content topics',
    'Custom profile badge',
  ];

  // Upload membership cover image once to use for all tiers
  const membershipImagePath = path.join(process.cwd(), 'membership.jpg');
  let coverImageUrl;

  try {
    if (fs.existsSync(membershipImagePath)) {
      console.log('Uploading membership cover image to S3...');
      coverImageUrl = await uploadFileToS3(
        membershipImagePath,
        'membership-covers/membership.jpg',
      );
      console.log(`Successfully uploaded membership cover to ${coverImageUrl}`);
    } else {
      console.log('Membership image not found, using fallback image URL');
      coverImageUrl = 'https://source.unsplash.com/random/600x300?membership';
    }
  } catch (error) {
    console.error('Error uploading membership cover image:', error);
    coverImageUrl = 'https://source.unsplash.com/random/600x300?membership';
  }

  for (let i = 0; i < count; i++) {
    const name = tierNames[i % tierNames.length];
    const monthlyRate = 5 + i * 5; // $5, $10, $15, etc.

    // Generate 3-5 unique benefits for this tier
    const tierBenefits = [];
    const benefitCount = Math.floor(Math.random() * 3) + 3; // 3-5 benefits
    const shuffledBenefits = [...benefits].sort(() => 0.5 - Math.random());
    for (let j = 0; j < benefitCount; j++) {
      tierBenefits.push(shuffledBenefits[j]);
    }

    tiers.push({
      creator: new Types.ObjectId(creatorId),
      name: `${name} Tier`,
      description: `${name} tier with exclusive content and special perks.`,
      monthlyRate,
      coverImage: coverImageUrl,
      isActive: true,
      benefits: tierBenefits,
      subscriberCount: Math.floor(Math.random() * 100) + 10,
      totalEarnings: Math.floor(Math.random() * 5000) + 500,
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000,
      ),
      updatedAt: new Date(),
    });
  }

  // Explicitly return an array to ensure it's iterable
  console.log(
    `Generated ${tiers.length} membership tiers for creator ${creatorId}`,
  );
  return tiers;
}

// Generate random posts for creators
function generatePosts(creatorId: string, count: number = 10) {
  const posts = [];
  const postTypes = [
    PostType.TEXT,
    PostType.IMAGE,
    PostType.AUDIO,
    PostType.VIDEO,
    PostType.LINK,
  ];
  const tags = [
    'Torah',
    'Israel',
    'Jewish Life',
    'Parenting',
    'Community',
    'History',
    'Culture',
    'Traditions',
    'Food',
    'Holidays',
  ];

  for (let i = 0; i < count; i++) {
    const postType = postTypes[Math.floor(Math.random() * postTypes.length)];
    const randomTags = [];
    // Add 1-3 random tags
    const tagCount = Math.floor(Math.random() * 3) + 1;
    const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
    for (let j = 0; j < tagCount; j++) {
      randomTags.push(shuffledTags[j]);
    }

    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    );

    // Create base post data
    const post: any = {
      type: postType,
      creator: new Types.ObjectId(creatorId),
      title: faker.lorem.sentence().slice(0, 80),
      description: faker.lorem.paragraph(),
      tags: randomTags,
      collections: [],
      status: PostStatus.PUBLISHED,
      isDeleted: false,
      isActive: true,
      viewCount: Math.floor(Math.random() * 1000) + 50,
      likeCount: Math.floor(Math.random() * 100) + 5,
      commentCount: Math.floor(Math.random() * 20) + 1,
      shareCount: Math.floor(Math.random() * 30),
      attachments: [],
      tierAccess: [],
      likes: [],
      comments: [],
      createdAt,
      updatedAt: new Date(),
    };

    // Add type-specific data
    switch (postType) {
      case PostType.TEXT:
        post.textContent = faker.lorem.paragraphs(3);
        break;
      case PostType.IMAGE:
        post.mediaUrls = [
          `https://source.unsplash.com/random/800x600?${randomTags[0]}`,
          `https://source.unsplash.com/random/800x600?${randomTags[0]}2`,
        ];
        post.thumbnailUrl = post.mediaUrls[0];
        break;
      case PostType.AUDIO:
        post.mediaUrls = [`https://example.com/audio${i}.mp3`];
        post.thumbnailUrl = `https://source.unsplash.com/random/400x400?audio`;
        break;
      case PostType.VIDEO:
        post.videoId = `dQw4w9WgXcQ`; // placeholder YouTube ID
        post.videoProvider = 'youtube';
        post.videoUrl = `https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
        post.thumbnailUrl = `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`;
        break;
      case PostType.LINK:
        post.linkUrl = `https://example.com/article${i}`;
        post.thumbnailUrl = `https://source.unsplash.com/random/800x400?link`;
        break;
    }

    // Generate comments (1-4 comments)
    const commentCount = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < commentCount; j++) {
      post.comments.push({
        _id: new Types.ObjectId(),
        user: new Types.ObjectId(), // This will be replaced with random users later
        text: faker.lorem.sentence(),
        createdAt: new Date(
          createdAt.getTime() + Math.floor(Math.random() * 48) * 60 * 60 * 1000,
        ),
      });
    }

    // Add likes (5-20 likes)
    const likeCount = Math.floor(Math.random() * 15) + 5;
    for (let j = 0; j < likeCount; j++) {
      post.likes.push({
        user: new Types.ObjectId(), // This will be replaced with random users later
        createdAt: new Date(
          createdAt.getTime() + Math.floor(Math.random() * 48) * 60 * 60 * 1000,
        ),
      });
    }

    posts.push(post);
  }

  return posts;
}

// Generate analytics insights for creators
function generateAnalytics(
  creatorId: string,
  posts: any[],
  membershipTiers: any[],
) {
  const postInsights = [];
  const membershipInsights = [];
  const earningsInsights = [];

  // Generate post insights
  for (const post of posts) {
    // We need to make sure the post has an _id before referencing it
    if (!post._id) {
      continue;
    }

    // Create 24 hours of insights for each post
    for (let i = 0; i < 24; i++) {
      const date = new Date();
      date.setHours(i, 0, 0, 0);

      const postAge = date.getTime() - new Date(post.createdAt).getTime();
      const daysSinceCreation = Math.max(
        1,
        Math.floor(postAge / (1000 * 60 * 60 * 24)),
      );
      const viewMultiplier = Math.max(0.1, 1 - daysSinceCreation / 30);

      const baseViews = 20 + Math.floor(Math.random() * 30);
      const hourlyViews = Math.floor(baseViews * viewMultiplier);

      const engagementRate = 0.05 + Math.random() * 0.05;
      const hourlyEngagements = Math.floor(hourlyViews * engagementRate);

      postInsights.push({
        post: post._id,
        creator: new Types.ObjectId(creatorId),
        date,
        impressions: hourlyViews,
        engagements: hourlyEngagements,
        createdAt: date,
        updatedAt: date,
      });
    }
  }

  // Generate membership insights (last 30 days)
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const tierBreakdown = {};
    membershipTiers.forEach((tier) => {
      const tierName = tier.name;
      const baseCount = 10 + Math.floor(Math.random() * 40);
      const growth = Math.floor(Math.random() * 10) - 3; // -3 to +6

      tierBreakdown[tierName] = {
        count: baseCount,
        growth,
      };
    });

    const activeMembers = Object.values(tierBreakdown).reduce(
      (sum: any, tier: any) => sum + tier.count,
      0,
    );
    const newMembers = Math.floor(Math.random() * 5) + 1;
    const upgradedMembers = Math.round(newMembers * 0.7);
    const cancelledMembers = Math.floor(Math.random() * 3);

    membershipInsights.push({
      creator: new Types.ObjectId(creatorId),
      date,
      activeMembers,
      newMembers,
      upgradedMembers,
      cancelledMembers,
      tierBreakdown,
      createdAt: date,
      updatedAt: date,
    });
  }

  // Generate earnings insights (last 6 months)
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);

    const tierBreakdown = {};
    let totalEarnings = 0;

    membershipTiers.forEach((tier) => {
      const tierName = tier.name;
      const amount = tier.monthlyRate * tier.subscriberCount;
      totalEarnings += amount;

      tierBreakdown[tierName] = {
        amount,
        percentage: 0, // Will be calculated after totalEarnings is known
      };
    });

    // Calculate percentages
    Object.values(tierBreakdown).forEach((tier: any) => {
      tier.percentage = Math.round((tier.amount / totalEarnings) * 100);
    });

    const membershipEarnings = totalEarnings;
    const oneTimeEarnings = Math.floor(Math.random() * 200);
    totalEarnings += oneTimeEarnings;

    earningsInsights.push({
      creator: new Types.ObjectId(creatorId),
      date,
      totalEarnings,
      membershipEarnings,
      oneTimeEarnings,
      tierBreakdown,
      createdAt: date,
      updatedAt: date,
    });
  }

  return { postInsights, membershipInsights, earningsInsights };
}

async function seedDatabase() {
  try {
    const connection = await connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const UserModel = connection.model('User', UserSchema);
    const PostModel = connection.model('Post', PostSchema);
    const MembershipModel = connection.model('Membership', MembershipSchema);
    const PostInsightModel = connection.model('PostInsight', PostInsightSchema);
    const MembershipInsightModel = connection.model(
      'MembershipInsight',
      MembershipInsightSchema,
    );
    const EarningsInsightModel = connection.model(
      'EarningsInsight',
      EarningsInsightSchema,
    );

    // Delete existing data
    await UserModel.deleteMany({});
    await PostModel.deleteMany({});
    await MembershipModel.deleteMany({});
    await PostInsightModel.deleteMany({});
    await MembershipInsightModel.deleteMany({});
    await EarningsInsightModel.deleteMany({});
    console.log('Cleared existing data');

    const password = 'password1234';
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUsers = [];
    const creatorIds = [];

    const malePhPath = path.join(
      process.cwd(),
      'profile-pictures',
      'placeholder-male.jpg',
    );
    const femalePhPath = path.join(
      process.cwd(),
      'profile-pictures',
      'placeholder-female.png',
    );

    let malePlaceholderUrl;
    let femalePlaceholderUrl;

    try {
      console.log('Uploading placeholder male image to S3...');
      malePlaceholderUrl = await uploadFileToS3(
        malePhPath,
        'profile-pictures/placeholder-male.jpg',
      );
      console.log(
        `Successfully uploaded male placeholder to ${malePlaceholderUrl}`,
      );

      console.log('Uploading placeholder female image to S3...');
      femalePlaceholderUrl = await uploadFileToS3(
        femalePhPath,
        'profile-pictures/placeholder-female.png',
      );
      console.log(
        `Successfully uploaded female placeholder to ${femalePlaceholderUrl}`,
      );
    } catch (error) {
      console.error('Error uploading placeholder images:', error);
      malePlaceholderUrl = '';
      femalePlaceholderUrl = '';
    }

    // Create all users first
    for (const mockUser of mockUsersData) {
      try {
        const pictureName = path.basename(mockUser.profilePicture);
        const localPicturePath = path.join(
          process.cwd(),
          'profile-pictures',
          pictureName,
        );

        let profilePictureUrl;

        if (fs.existsSync(localPicturePath)) {
          // If the specific image exists, upload it
          console.log(
            `Uploading profile picture for ${mockUser.displayName} to S3...`,
          );

          const s3Key = `${mockUser.creatorUsername}/${pictureName}`;
          profilePictureUrl = await uploadFileToS3(localPicturePath, s3Key);
          console.log(`Successfully uploaded to ${profilePictureUrl}`);
        } else {
          // If specific image doesn't exist, use the appropriate placeholder URL
          console.log(`Using placeholder image for ${mockUser.displayName}`);
          if (mockUser.gender === 'Female') {
            profilePictureUrl = femalePlaceholderUrl;
          } else {
            profilePictureUrl = malePlaceholderUrl;
          }
          console.log(`Using placeholder image: ${profilePictureUrl}`);
        }

        // Add random creator metrics
        const lifetimeEarnings = Math.floor(Math.random() * 10000) + 1000;
        const availableBalance = Math.floor(Math.random() * 1000) + 100;
        const pendingBalance = Math.floor(Math.random() * 500);

        // Assign a random creator category
        const categoryValues = Object.values(CreatorCategory);
        const randomCategory =
          categoryValues[Math.floor(Math.random() * categoryValues.length)];

        const user = new UserModel({
          email: mockUser.email,
          password: hashedPassword,
          provider: AuthProvider.LOCAL,
          displayName: mockUser.displayName,
          gender: mockUser.gender,
          profilePicture: profilePictureUrl,
          creatorUsername: mockUser.creatorUsername,
          creatorHeadline: mockUser.creatorHeadline,
          isCreator: true,
          creatorStatus: CreatorStatus.PUBLISHED,
          hasCompletedStripeOnboarding: true,
          stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 15)}`,
          stripeConnectAccountId: 'acct_1R4HtZ5WPpgW8MqO',
          contentVisibleTo: ContentVisibility.BOTH,
          createdAt: new Date(),
          updatedAt: new Date(),
          lifetimeEarnings,
          availableBalance,
          pendingBalance,
          creatorCategory: randomCategory,
        });

        const savedUser = await user.save();
        createdUsers.push(savedUser);
        creatorIds.push(savedUser._id.toString());
        console.log(`Created user: ${mockUser.displayName}`);
      } catch (error) {
        console.error(`Error processing user ${mockUser.displayName}:`, error);
      }
    }

    // Create all non-creator users as well (for comments, etc.)
    const regularUsers = [];
    for (let i = 0; i < 50; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const gender = Math.random() > 0.5 ? 'Male' : 'Female';

      const regularUser = new UserModel({
        email: faker.internet.email({ firstName, lastName }),
        password: hashedPassword,
        provider: AuthProvider.LOCAL,
        displayName: `${firstName} ${lastName}`,
        gender: gender,
        profilePicture:
          gender === 'Female' ? femalePlaceholderUrl : malePlaceholderUrl,
        isCreator: false,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
        ),
        updatedAt: new Date(),
      });

      const savedUser = await regularUser.save();
      regularUsers.push(savedUser);
    }
    console.log(`Created ${regularUsers.length} regular users`);

    // Now create memberships, posts, and analytics for each creator
    for (const creatorId of creatorIds) {
      // Generate 2-5 membership tiers for each creator
      const tierCount = Math.floor(Math.random() * 4) + 2; // 2-5 tiers
      let membershipTiers;
      try {
        membershipTiers = await generateMembershipTiers(creatorId, tierCount);
        if (!Array.isArray(membershipTiers)) {
          console.error(
            `Error: membershipTiers is not an array. Got type: ${typeof membershipTiers}`,
          );
          membershipTiers = []; // Provide a fallback empty array
        }
        console.log(
          `Retrieved ${membershipTiers.length} membership tiers for creator ${creatorId}`,
        );
      } catch (error) {
        console.error(`Error generating membership tiers:`, error);
        membershipTiers = []; // Fallback to empty array if there's an error
      }

      for (const tier of membershipTiers) {
        const membershipModel = new MembershipModel(tier);
        await membershipModel.save();
      }
      console.log(
        `Created ${membershipTiers.length} membership tiers for creator ${creatorId}`,
      );

      // Generate 5-10 posts for each creator
      const postCount = Math.floor(Math.random() * 6) + 5; // 5-10 posts
      const posts = generatePosts(creatorId, postCount);

      // Assign random users to comments and likes
      posts.forEach((post) => {
        // Assign real users to likes
        post.likes.forEach((like, index) => {
          // Distribute likes between regular users and creators
          const likingUser =
            Math.random() > 0.8
              ? createdUsers[Math.floor(Math.random() * createdUsers.length)]
              : regularUsers[Math.floor(Math.random() * regularUsers.length)];

          post.likes[index].user = likingUser._id;
        });

        // Assign real users to comments
        post.comments.forEach((comment, index) => {
          // Distribute comments between regular users and creators
          const commentingUser =
            Math.random() > 0.7
              ? createdUsers[Math.floor(Math.random() * createdUsers.length)]
              : regularUsers[Math.floor(Math.random() * regularUsers.length)];

          post.comments[index].user = commentingUser._id;
        });
      });

      // Posts are now saved earlier in the process

      // Need to save posts first so they have IDs
      const savedPosts = [];
      for (const post of posts) {
        const postModel = new PostModel(post);
        const savedPost = await postModel.save();
        savedPosts.push(savedPost);
      }
      console.log(
        `Created ${savedPosts.length} posts for creator ${creatorId}`,
      );

      // Generate analytics for the creator (using saved posts that have IDs)
      const analytics = generateAnalytics(
        creatorId,
        savedPosts,
        membershipTiers,
      );

      // Save post insights
      for (const insight of analytics.postInsights) {
        const insightModel = new PostInsightModel(insight);
        await insightModel.save();
      }

      // Save membership insights
      for (const insight of analytics.membershipInsights) {
        const insightModel = new MembershipInsightModel(insight);
        await insightModel.save();
      }

      // Save earnings insights
      for (const insight of analytics.earningsInsights) {
        const insightModel = new EarningsInsightModel(insight);
        await insightModel.save();
      }

      console.log(`Created analytics for creator ${creatorId}`);
    }

    console.log(`Successfully created ${createdUsers.length} users`);
    console.log('Database seeding completed successfully');

    await connection.disconnect();
    console.log('Disconnected from MongoDB');

    return { success: true, count: createdUsers.length };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
}

seedDatabase()
  .then((result) => {
    if (result.success) {
      console.log(`Successfully seeded database with ${result.count} users`);
      process.exit(0);
    } else {
      console.error('Failed to seed database');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Unhandled error during seeding:', err);
    process.exit(1);
  });
