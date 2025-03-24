import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createComments = mutation({
    args: {
        //userId: v.id("users"),
        //imageUrl: v.string(),
        postId: v.id("posts"),
        content: v.string(),
        //likes: v.number(),
        //comments: v.number(),
    },
    handler: async (ctx, args) => {
        const currentUser = await getCurrentUser(ctx);

        const post = await ctx.db.get(args.postId);
        if(!post) throw new ConvexError("Post not found");
        // increase count posts by 1

        const commentId = await ctx.db.insert("comments",{
            postId: args.postId,
            content: args.content,
            userId: currentUser._id,
        });

        await ctx.db.patch(args.postId, {comments: post.comments + 1});

        if(currentUser._id !== post.userId){
            // send notification
            await ctx.db.insert("notifications",{
                receiverId: post.userId,
                type: "comment",
                senderId: currentUser._id,
                commentId: commentId
            });
        }
    },
});


export const getComments= query({
    args:{postId: v.id("posts")},
    handler: async (ctx,args) => {
        const currentUser = await getCurrentUser(ctx);

        if(!currentUser) throw new Error("User not login");

        const comments = await ctx.db.query("comments").withIndex("by_post",(q) => q.eq("postId", args.postId)).collect();

        if(comments.length === 0)return [];

        const commentsWithInfo = await Promise.all(
            comments.map(async (comment) => {
                const user = await ctx.db.get(comment.userId);
                return {
                    ...comment,
                    user:{
                        fullname:user?.fullname,
                        image:user?.image
                    }
                }
            })

        )

        return commentsWithInfo;
    }
});
