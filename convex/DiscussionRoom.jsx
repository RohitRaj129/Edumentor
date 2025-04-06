import { mutation } from "./_generated/server";
import { v } from "convex/values";
export const CreateNewRoom = mutation({
  args: {
    coahingOption: v.string(),
    topic: v.string(),
    expertNameL: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert("DiscussionRoom", {
      coahingOption: args.coahingOption,
      topic: args.topic,
      expertName: args.expertName,
    });
    return result;
  },
});
