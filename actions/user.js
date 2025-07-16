"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server"; // Import currentUser
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard"; // Assuming this is correct path

export async function updateUser(data) {
  const { userId } = auth(); // Clerk's auth() can be called directly here
  if (!userId) throw new Error("Unauthorized");

  // Get the current user from your DB using clerkUserId
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    // This case should ideally not happen if getUserOnboardingStatus or a similar
    // function creates the user upon first login. But it's a good safeguard.
    throw new Error("User not found in database for the authenticated Clerk user.");
  }

  try {
    const result = await db.$transaction(
      async (tx) => {
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        if (!industryInsight) {
          console.log(`Generating AI insights for new industry: ${data.industry}`);
          const insights = await generateAIInsights(data.industry);

          industryInsight = await tx.industryInsight.create({ // Use tx for transaction
            data: {
              industry: data.industry,
              averageSalary: insights.averageSalary, // Ensure these fields match your schema
              inDemandSkills: insights.inDemandSkills,
              industryGrowth: insights.industryGrowth,
              // ... other fields from generateAIInsights
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
            isOnboarded: true, // Mark as onboarded after profile update
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000,
      }
    );

    revalidatePath("/");
    // Return updatedUser instead of result.user
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile: " + error.message); // Provide more detail in error
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = auth(); // Get userId from Clerk's auth()
  if (!userId) {
    // If no Clerk userId, user is not authenticated.
    // For dashboard or secure routes, this should redirect to login page.
    // Return default or throw an error that the calling component can catch.
    return { isOnboarded: false, user: null };
  }

  // Get the Clerk user object for more details like email
  const clerkUser = await currentUser();

  // If clerkUser or their email is missing, something is wrong with Clerk session
  if (!clerkUser || !clerkUser.emailAddresses?.[0]?.emailAddress) {
    console.error("Clerk user or email address not found for authenticated userId:", userId);
    return { isOnboarded: false, user: null }; // Or throw specific error
  }

  const userEmail = clerkUser.emailAddresses[0].emailAddress;

  // Find or Create the user in YOUR database
  let user = await db.user.findUnique({
    where: { clerkUserId: userId }, // Prefer clerkUserId for unique lookup
  });

  if (!user) {
    // If not found by clerkUserId, try by email (less reliable as email can change or be used by multiple Clerk accounts if not primary key)
    user = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      // User does not exist in your database, create them
      try {
        console.log(`Creating new user in DB for Clerk ID: ${userId}, Email: ${userEmail}`);
        user = await db.user.create({
          data: {
            clerkUserId: userId,
            email: userEmail,
            name: clerkUser.firstName || clerkUser.emailAddresses[0].emailAddress, // Or use clerkUser.fullName
            isOnboarded: false, // Default to not onboarded
            // Add other default fields for a new user as per your Prisma schema
          },
        });
      } catch (error) {
        // This catch block handles the "Unique constraint failed on the fields: ('email')"
        // if a race condition occurs or if a user with that email already exists
        // but somehow wasn't linked to this clerkUserId (less common if using clerkUserId as primary link).
        console.error(`Error creating user in DB for Clerk ID ${userId}:`, error);
        // If it was a unique constraint failure, try to find the existing user again
        // This is a recovery mechanism for race conditions or data inconsistencies.
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
             console.warn(`Email unique constraint violation for ${userEmail}. Attempting to retrieve existing user.`);
             user = await db.user.findUnique({ where: { email: userEmail } });
             if (user && user.clerkUserId === null) {
                 // If found by email but no clerkUserId, link it
                 user = await db.user.update({
                     where: { id: user.id },
                     data: { clerkUserId: userId }
                 });
                 console.log(`Linked existing user (email: ${userEmail}) to new Clerk ID ${userId}.`);
             } else if (user && user.clerkUserId !== userId) {
                 // User exists with email but different clerkId (shouldn't happen often)
                 console.error(`Existing user with email ${userEmail} linked to different Clerk ID ${user.clerkUserId}.`);
                 throw new Error("Account with this email already exists and is linked to another user. Please contact support.");
             }
        } else {
            throw new Error("Failed to create user record: " + error.message);
        }
      }
    } else {
        // User found by email but not by clerkUserId. Link clerkUserId to existing user.
        // This is important if an existing user from a previous auth system is migrating to Clerk.
        if (user.clerkUserId === null) { // Only update if not already linked
            try {
                user = await db.user.update({
                    where: { id: user.id },
                    data: { clerkUserId: userId },
                });
                console.log(`Linked existing user (email: ${userEmail}) to Clerk ID ${userId}.`);
            } catch (updateError) {
                console.error("Error linking existing user to Clerk ID:", updateError);
                throw new Error("Failed to link existing user to Clerk account.");
            }
        }
    }
  }

  // At this point, 'user' should always be a valid Prisma user object
  if (!user) {
    // Fallback error if, after all attempts, user is still null (should be rare)
    console.error("Critical: User object is null after find/create operation.");
    throw new Error("Failed to retrieve or create user in database.");
  }

  // Return whether the user is onboarded based on the 'industry' field
  // Assuming 'industry' is a mandatory field for being considered onboarded.
  // Or, you might have an 'isOnboarded' boolean field in your User model.
  return {
    isOnboarded: !!user.industry, // Checks if industry is not null/undefined/empty string
    user: user, // Optionally return the user object as well for convenience
  };
}