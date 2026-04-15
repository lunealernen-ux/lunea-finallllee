"use client";
import { useEffect, useState } from "react";
import { useLuneaStore } from "@/store/lunea";
import { LandingScreen } from "@/components/shared/LandingScreen";
import { TeacherSetup } from "@/components/teacher/TeacherSetup";
import { SessionView } from "@/components/teacher/SessionView";
import { StudentJoin } from "@/components/student/StudentJoin";
import { StudentSessionView } from "@/components/student/StudentSessionView";

export default function Home() {
  const { view } = useLuneaStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (view === "landing") return <LandingScreen />;
  if (view === "teacher-setup") return <TeacherSetup />;
  if (view === "teacher-session") return <SessionView />;
  if (view === "student-join") return <StudentJoin />;
  if (view === "student-session") return <StudentSessionView />;
  return <LandingScreen />;
}
