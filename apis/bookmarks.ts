import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const bookmarkPost = mutation({
    args: {
        postId: v.id("posts"),
    },
    handler: async (ctx, args) => {
        const currentUser = await getCurrentUser(ctx);

        const bookmark = await ctx.db.query("bookmarks")
            .withIndex("by_both", 
                (q) => q.eq("userId",currentUser._id)
                    .eq("postId",args.postId)
        ).first();

        const post = await ctx.db.get(args.postId);
        if(!post){
            throw new Error("Post not found");  
        }

        if(bookmark){
            await ctx.db.delete(bookmark._id);
            return false;
        }else{
            await ctx.db.insert("bookmarks",{
                userId: currentUser._id,
                postId: args.postId
            });
            
            return true;
        }
    }
});

export const getBookmarks = query({
    handler: async (ctx) => {
      const currentUser = await getCurrentUser(ctx);
  
      if (!currentUser) throw new Error("User not logged in");
  
      const bookmarks = await ctx.db
        .query("bookmarks")
        .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
        .order("desc")
        .collect();
  
      const bookmarksWithInfo = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const post = await ctx.db.get(bookmark.postId);
          return post || null; // Ensure we handle missing posts
        })
      );
  
      return bookmarksWithInfo.filter((post) => post !== null); // Remove null values
    },
  });
  
