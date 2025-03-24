import { Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
    args: {
        username: v.string(),
        fullname: v.string(),
        email: v.string(),
        bio: v.optional(v.string()),
        image: v.string(),
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        console.log("Searching for user with email:", args.email);

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        
        if (existingUser) return;

        await ctx.db.insert("users", {
            username: args.username,
            fullname: args.fullname,
            email: args.email,
            bio: args.bio,
            image: args.image,
            clerkId: args.clerkId,
            followers: 0, 
            following: 0, 
            posts: 0, 
        });
    },
});

export async function getCurrentUser(ctx: QueryCtx) {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) {
        throw new Error("Unauthorized");
    }
    
    const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userIdentity.subject)) // ✅ Use Clerk ID
        .first();

    if (!user) {
        throw new Error("User not found in database.");
    }

    return user;
};

export const getUserByClerkId= query({
    args:{clerkId:v.string()},
    handler: async (ctx,args) => {
        const user = await ctx.db.query("users").withIndex("by_clerk_id",(q) => q.eq("clerkId", args.clerkId)).unique();

        return user;
    }
});

export const updateProfile = mutation({
    args:{
        fullname:v.string(),
        bio:v.optional(v.string()),
    },
    handler: async (ctx,args) => {
        const user = await getCurrentUser(ctx);

        await ctx.db.patch(user._id,{fullname:args.fullname,bio:args.bio})
    }
})

export const getUserProfile = query({
    args:{userId:v.id("users")},    
    handler: async (ctx,args) => {
        const user = await ctx.db.get(args.userId);
        if(!user){
            throw new Error("User not found");
        }

        return user;
    }
})

export const isFollowing = query({
    args:{followingId:v.id("users")},
    handler: async (ctx,args) => {
        const user = await getCurrentUser(ctx);

        const follow = await ctx.db.query("follows").withIndex("by_both",(q) => q.eq("followerId",user._id).eq("followingId",args.followingId)).first();

        return !!follow;
    }
});

export const followUser = mutation({
    args:{followingId:v.id("users")},   
    handler: async (ctx,args) => {
        const user = await getCurrentUser(ctx);
        const exising = await ctx.db.query("follows").withIndex("by_both",(q) => q.eq("followerId",user._id).eq("followingId",args.followingId)).first();

        if(exising){
            //unfollow
            await ctx.db.delete(exising._id);
            await updateFollowerCount(ctx,user._id,args.followingId,-1);
        }
        else{
            //follow
            await ctx.db.insert("follows",{followerId:user._id,followingId:args.followingId});
            await updateFollowerCount(ctx,user._id,args.followingId, 1);
        }

        // create notification
        await ctx.db.insert("notifications",{receiverId:args.followingId,senderId:user._id,type:"follow"});
    }
});

const updateFollowerCount = async (ctx:MutationCtx,followerId:Id<"users">,followingId:Id<"users">,isFollow:number) => {
    const follower = await ctx.db.get(followerId);
    const following = await ctx.db.get(followingId);

    if(follower && following) {
        await ctx.db.patch(followerId,{following: follower.following + isFollow});
        await ctx.db.patch(followingId,{followers: following.followers + isFollow});
    }
}

export const updateAvatar = mutation({
    args:{
        userId: v.id("users"),
        newAvatar: v.string()
    },
    handler: async (ctx,args) => {
        const user = await ctx.db.get(args.userId);

        if(!user) throw new Error("user not login");

        await ctx.db.patch(args.userId,{image: args.newAvatar});
    }
});