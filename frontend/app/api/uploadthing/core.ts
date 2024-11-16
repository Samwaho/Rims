import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAuthUser } from "@/lib/actions";

const f = createUploadthing({
  errorFormatter: (err) => {
    console.error("Upload error:", err);
    return { message: "Failed to upload images" };
  },
});

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      try {
        const user = await getAuthUser();
        if (!user) throw new Error("Unauthorized");
        return { userId: user._id };
      } catch (error) {
        console.error("Middleware error:", error);
        throw new Error("Authentication failed");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("file url", file.url);
        return { uploadedBy: metadata.userId };
      } catch (error) {
        console.error("Upload complete error:", error);
        throw error;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
