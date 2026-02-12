import type { WebhookEvent } from "@clerk/nextjs/server";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateRequest(request);
  if (!event) {
    return new Response("Invalid request", { status: 400 });
  }

  switch (event.type) {
    case "user.created": {
      // first_name can be null for OAuth; email_addresses can be empty on first webhook
      const primaryEmail = event.data.email_addresses?.[0]?.email_address;
      const email = primaryEmail ?? `${event.data.id}@clerk.user`;
      const name =
        event.data.first_name ??
        primaryEmail?.split("@")[0] ??
        "Unknown";

      console.log("clerk webhook: user.created", event.data.id, name, email);

      await ctx.runMutation(internal.user.createUser, {
        clerkId: event.data.id,
        email,
        imageUrl: event.data.image_url ?? "",
        name,
      });
      break;
    }
    case "user.updated": {
      const primaryEmail = event.data.email_addresses?.[0]?.email_address;
      const email = primaryEmail ?? `${event.data.id}@clerk.user`;

      console.log("clerk webhook: user.updated", event.data.id);

      await ctx.runMutation(internal.user.updateUser, {
        clerkId: event.data.id,
        imageUrl: event.data.image_url ?? "",
        email,
      });
      break;
    }
    case "user.deleted": {
      console.log("clerk webhook: user.deleted", event.data.id);

      await ctx.runMutation(internal.user.deleteUser, {
        clerkId: event.data.id as string,
      });
      break;
    }
    default:
      console.log("clerk webhook: unhandled event type", event.type);
  }

  return new Response(null, { status: 200 });
});

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: handleClerkWebhook,
});

const validateRequest = async (
  req: Request
): Promise<WebhookEvent | undefined> => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error(
      "CLERK_WEBHOOK_SECRET is not set in Convex environment variables. " +
        "Run: npx convex env set CLERK_WEBHOOK_SECRET <your-secret>"
    );
    return undefined;
  }

  const payloadString = await req.text();

  // Validate required webhook headers before verification
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing required webhook headers", {
      hasSvixId: !!svixId,
      hasSvixTimestamp: !!svixTimestamp,
      hasSvixSignature: !!svixSignature,
    });
    return undefined;
  }

  const svixHeaders = {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  };

  try {
    const wh = new Webhook(webhookSecret);
    const event = wh.verify(payloadString, svixHeaders);
    return event as unknown as WebhookEvent;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return undefined;
  }
};

export default http;