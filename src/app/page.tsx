"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLuneaStore } from "@/store/lunea";
import { LandingScreen } from "@/components/shared/LandingScreen";
import { TeacherSetup } from "@/components/teacher/TeacherSetup";
import { SessionView } from "@/components/teacher/SessionView";
import { StudentJoin } from "@/components/student/StudentJoin";
import { StudentSessionView } from "@/components/student/StudentSessionView";

function AppContent() {
  const { view, setView, session } = useLuneaStore();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const code = searchParams.get("code");
    if (code && view === "landing") {
      useLuneaStore.setState({ view: "student-join" });
      (window as unknown as Record<string, string>).__LUNEA_CODE__ = code;
    }
  }, []);

  if (!mounted) return null;

  if (view === "landing") return <LandingScreen />;
  if (view === "teacher-setup") return <TeacherSetup />;
  if (view === "teacher-session") return <SessionView />;
  if (view === "student-join") return <StudentJoin />;
  if (view === "student-session") return <StudentSessionView />;
  return <LandingScreen />;
}

export default function Home() {
  return (
    <Suspense>
      <AppContent />
    </Suspense>
  );
}
