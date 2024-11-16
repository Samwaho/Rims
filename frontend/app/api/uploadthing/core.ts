import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAuthUser } from "@/lib/actions";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
    .middleware(async () => {
      try {
        const user = await getAuthUser();
        if (!user || user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return { userId: user.id };
      } catch (err) {
        throw new Error("Unauthorized");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
