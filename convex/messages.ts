// convex/messages.ts
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const sendMessages = mutation({
    args: {
        type: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
        content: v.string(),
        senderId: v.id("users"),
        receiverId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const sender = await ctx.db.get(args.senderId);
        const receiver = await ctx.db.get(args.receiverId);

        if (!sender || !receiver) throw new ConvexError("Invalid sender or receiver");

        const messageId = await ctx.db.insert("messages", {
            senderId: sender._id,
            receiverId: receiver._id,
            type: args.type,
            content: args.content,
        });

        await ctx.db.insert("notifications", {
            receiverId: receiver._id,
            type: "message",
            senderId: sender._id,
            messageId: messageId,
        });
    },
});

export const getMessages = query({
    args: {
        senderId: v.id("users"),
        receiverId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const sentMessages = await ctx.db
        .query("messages")
        .withIndex("by_sender_and_receiver", (q) =>
            q.eq("receiverId", args.senderId).eq("senderId", args.receiverId)
        )
        .order("asc")
        .collect();

        // Fetch messages from receiver to sender
        const receivedMessages = await ctx.db
        .query("messages")
        .withIndex("by_sender_and_receiver", (q) =>
            q.eq("receiverId", args.receiverId).eq("senderId", args.senderId)
        )
        .order("asc")
        .collect();

        // Merge and sort all messages
        const allMessages = [...sentMessages, ...receivedMessages].sort(
        (a, b) => a._creationTime - b._creationTime
        );

        if (allMessages.length === 0) return [];

        const messagesWithInfo = await Promise.all(
            allMessages.map(async (message) => {
                const sender = await ctx.db.get(message.senderId);
                const receiver = await ctx.db.get(message.receiverId);
                return {
                    ...message,
                    sender: {
                        username: sender?.username,
                        image: sender?.image,
                    },
                    receiver: {
                        username: receiver?.username,
                        image: receiver?.image,
                    },
                };
            })
        );

        return messagesWithInfo;
    },
});
