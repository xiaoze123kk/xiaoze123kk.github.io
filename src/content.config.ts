import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/data/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    status: z.enum(["种子", "生长中", "常青"]),
    topics: z.array(z.string()).default([]),
    readMinutes: z.number().int().positive(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: file("./src/data/projects.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    kind: z.string(),
    year: z.number(),
    description: z.string(),
    quote: z.string(),
    tech: z.array(z.string()),
    href: z.string().url(),
    featured: z.boolean().default(false),
  }),
});

const books = defineCollection({
  loader: file("./src/data/books.json"),
  schema: z.object({
    id: z.string(),
    shelf: z.string(),
    title: z.string(),
    author: z.string(),
    status: z.string(),
    note: z.string(),
  }),
});

const tracks = defineCollection({
  loader: file("./src/data/music.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    artist: z.string(),
    note: z.string(),
    added: z.string(),
    audio: z.string().optional(),
  }),
});

const moments = defineCollection({
  loader: file("./src/data/moments.json"),
  schema: z.object({
    id: z.string(),
    date: z.coerce.date(),
    weekday: z.string(),
    place: z.string(),
    text: z.string(),
  }),
});

export const collections = { articles, projects, books, tracks, moments };
