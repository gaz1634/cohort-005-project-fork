import type { LessonLoaderData } from "./types";
import { LessonBreadcrumb } from "./lesson-breadcrumb";
import { BookmarkToggle, LessonNote } from "./lesson-note";
import { CurriculumSidebar } from "./curriculum-sidebar";
import { QuizSection } from "./quiz-section";
import { LessonCompletion, LessonPrevNext } from "./lesson-footer";
import { useState, useEffect, useCallback } from "react";
import { useFetcher } from "react-router";
import { CommentThread } from "~/components/comment-thread";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Clock, Github } from "lucide-react";
import { formatDuration } from "~/lib/utils";
import { YouTubePlayer } from "~/components/youtube-player";

type FullLessonData = Extract<LessonLoaderData, { view: "full" }>;

const AUTOPLAY_KEY = "cadence-autoplay";

function useAutoplay() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem(AUTOPLAY_KEY) === "true");
    } catch {
      /* silently fail */
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AUTOPLAY_KEY, String(next));
      } catch {
        /* silently fail */
      }
      return next;
    });
  }, []);

  return [enabled, toggle] as const;
}

export function FullLesson({ data }: { data: FullLessonData }) {
  const { course, curriculum, module: mod, lesson } = data;

  return (
    <div className="flex">
      <CurriculumSidebar
        course={course}
        curriculum={curriculum}
        currentLessonId={lesson.id}
        lessonProgressMap={data.lessonProgressMap}
        enrolled={data.enrolled}
      />

      <div className="flex-1 p-6 lg:p-8">
        <LessonBreadcrumb
          course={course}
          mod={mod}
          lessonTitle={lesson.title}
        />

        <div className="mx-auto max-w-4xl">
          <LessonHeader data={data} />
          <LessonBody data={data} />

          {data.enrolled && data.currentUserId && (
            <LessonCompletion
              lessonId={lesson.id}
              lessonStatus={data.lessonStatus}
              courseSlug={course.slug}
              nextLesson={data.nextLesson}
            />
          )}

          {/* Questions & Discussion — confidential to people with access */}
          <CommentThread
            comments={data.comments}
            currentUserId={data.currentUserId}
            canModerate={data.canModerate}
            canPost
            instructorName={data.instructorName}
          />

          <LessonPrevNext
            course={course}
            prevLesson={data.prevLesson}
            nextLesson={data.nextLesson}
          />
        </div>
      </div>
    </div>
  );
}

function LessonHeader({ data }: { data: FullLessonData }) {
  const { lesson } = data;
  return (
    <>
      <div className="mb-2 flex items-start justify-between gap-3">
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        {data.currentUserId && <BookmarkToggle bookmarked={data.bookmarked} />}
      </div>
      <div className="mb-6 flex items-center gap-3">
        {lesson.durationMinutes && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {formatDuration(lesson.durationMinutes, true, false, false)}
          </div>
        )}
        {lesson.githubRepoUrl && (
          <a
            href={lesson.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <Github className="mr-1.5 size-4" />
              Open Code
            </Button>
          </a>
        )}
      </div>
    </>
  );
}

function LessonBody({ data }: { data: FullLessonData }) {
  const { lesson, contentHtml, currentUserId } = data;
  const [autoplay, toggleAutoplay] = useAutoplay();

  return (
    <>
      {lesson.videoUrl && (
        <YouTubePlayer
          videoUrl={lesson.videoUrl}
          lessonId={lesson.id}
          title={lesson.title}
          startPosition={data.lastWatchPosition}
          durationMinutes={lesson.durationMinutes}
          watchProgress={data.watchProgress}
          trackingEnabled={data.enrolled && !!currentUserId}
          autoplay={autoplay}
          onToggleAutoplay={toggleAutoplay}
        />
      )}

      {/* Note — under the video, so the Student can write while they watch */}
      {currentUserId && <LessonNote key={lesson.id} note={data.note} />}

      {contentHtml && (
        <div
          className="prose prose-neutral dark:prose-invert mb-8 max-w-none"
          // oxlint-disable-next-line react/no-danger -- the instructor wrote this Markdown
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}

      {!contentHtml && !lesson.videoUrl && (
        <Card className="mb-8">
          <CardContent className="py-12 text-center text-muted-foreground">
            No content has been added to this lesson yet.
          </CardContent>
        </Card>
      )}

      {data.quiz && data.enrolled && currentUserId && (
        <LessonQuiz
          lessonId={lesson.id}
          quiz={data.quiz}
          bestAttempt={data.bestAttempt}
        />
      )}
    </>
  );
}

function LessonQuiz({
  lessonId,
  quiz,
  bestAttempt,
}: {
  lessonId: number;
  quiz: NonNullable<FullLessonData["quiz"]>;
  bestAttempt: FullLessonData["bestAttempt"];
}) {
  const quizFetcher = useFetcher({ key: `quiz-${lessonId}` });
  return (
    <QuizSection
      quiz={quiz}
      bestAttempt={bestAttempt}
      quizResult={quizFetcher.data?.quizResult ?? null}
      quizFetcher={quizFetcher}
      isSubmitting={quizFetcher.state !== "idle"}
    />
  );
}
