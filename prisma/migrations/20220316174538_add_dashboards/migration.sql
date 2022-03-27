-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "ownerID" TEXT NOT NULL,
    "layout" JSONB NOT NULL,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
