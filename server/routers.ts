import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { extractFromJournal, extractMoodFromJournal } from "./extraction";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  extraction: router({
    extract: publicProcedure
      .input(
        z.object({
          journalText: z.string().min(1),
          date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
          mood: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await extractFromJournal({
            journalText: input.journalText,
            date: input.date,
            mood: input.mood,
          });
          return {
            success: true,
            extraction: result,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),

    extractMood: publicProcedure
      .input(z.object({ journalText: z.string().min(1) }))
      .query(async ({ input }) => {
        const mood = await extractMoodFromJournal(input.journalText);
        return { mood };
      }),
  })
});

export type AppRouter = typeof appRouter;
