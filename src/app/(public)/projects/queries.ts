import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export type PublicProject = {
  id: string;
  name: string;
  publicAlias: string;
  publicDescription: string | null;
  publicTags: string[] | null;
  publicLiveUrl: string | null;
  startDate: string | null;
  endDate: string | null;
};

const publicProjectColumns = {
  id: projects.id,
  name: projects.name,
  publicAlias: projects.publicAlias,
  publicDescription: projects.publicDescription,
  publicTags: projects.publicTags,
  publicLiveUrl: projects.publicLiveUrl,
  startDate: projects.startDate,
  endDate: projects.endDate,
};

function hasAlias<T extends { publicAlias: string | null }>(
  row: T,
): row is T & { publicAlias: string } {
  return row.publicAlias !== null;
}

export async function getPublicProjects(): Promise<PublicProject[]> {
  const rows = await db
    .select(publicProjectColumns)
    .from(projects)
    .where(
      and(
        eq(projects.isPublic, true),
        isNull(projects.deletedAt),
        isNotNull(projects.publicAlias),
      ),
    )
    .orderBy(
      sql`${projects.endDate} DESC NULLS LAST`,
      desc(projects.createdAt),
    );

  return rows.filter(hasAlias);
}

export async function getPublicProjectById(id: string): Promise<PublicProject | null> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return null;

  const rows = await db
    .select(publicProjectColumns)
    .from(projects)
    .where(
      and(
        eq(projects.id, parsed.data),
        eq(projects.isPublic, true),
        isNull(projects.deletedAt),
        isNotNull(projects.publicAlias),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row || !hasAlias(row)) return null;
  return row;
}
