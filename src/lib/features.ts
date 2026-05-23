import {
  BookOpen,
  Brain,
  FileText,
  FolderOpen,
  GraduationCap,
  Headphones,
  MessageSquare,
  Mic2,
  Share2,
  Upload,
  Youtube,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  pro: boolean;
  turboParity: string;
};

export const FEATURES: Feature[] = [
  {
    id: "pdf-notes",
    name: "PDF to notes",
    description: "Upload PDFs and get structured study notes in ~30 seconds.",
    href: "/app/pdf",
    icon: FileText,
    pro: false,
    turboParity: "PDF → notes",
  },
  {
    id: "audio-notes",
    name: "Audio & lecture notes",
    description: "Record or upload lectures; auto-transcribe into clean notes.",
    href: "/app/audio",
    icon: Mic2,
    pro: false,
    turboParity: "Live lecture / audio → notes",
  },
  {
    id: "youtube-notes",
    name: "YouTube to notes",
    description: "Paste any YouTube URL and turn the video into study notes.",
    href: "/app/youtube",
    icon: Youtube,
    pro: true,
    turboParity: "YouTube → notes",
  },
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Generate flashcards from any note instantly.",
    href: "/app/flashcards",
    icon: Brain,
    pro: false,
    turboParity: "Flashcards from notes",
  },
  {
    id: "quiz",
    name: "Quizzes",
    description: "Exam-prep quizzes with instant feedback from your notes.",
    href: "/app/quiz",
    icon: GraduationCap,
    pro: false,
    turboParity: "Quizzes from notes",
  },
  {
    id: "chat",
    name: "AI chat",
    description: "Talk to your notes — ask questions and get cited answers.",
    href: "/app/chat",
    icon: MessageSquare,
    pro: false,
    turboParity: "Chat with notes",
  },
  {
    id: "editor",
    name: "Note editor",
    description: "Edit, format, and refine notes with tables and headings.",
    href: "/app/notes",
    icon: BookOpen,
    pro: false,
    turboParity: "Editable formatted notes",
  },
  {
    id: "folders",
    name: "Folders",
    description: "Organize notes by class, project, or topic.",
    href: "/app/folders",
    icon: FolderOpen,
    pro: false,
    turboParity: "Folder organization",
  },
  {
    id: "share",
    name: "Share",
    description: "Share notes with classmates via link.",
    href: "/app/share",
    icon: Share2,
    pro: false,
    turboParity: "Share with peers",
  },
  {
    id: "upload",
    name: "Upload anything",
    description: "Drop files to start — PDF, audio, or text.",
    href: "/app/upload",
    icon: Upload,
    pro: false,
    turboParity: "Multi-format upload",
  },
  {
    id: "podcast",
    name: "Podcast link & generator",
    description: "Attach your show URL and turn notes into audio podcasts.",
    href: "/app/podcast",
    icon: Headphones,
    pro: true,
    turboParity: "Podcast from notes + show link",
  },
];

export const FREE_FEATURES = FEATURES.filter((f) => !f.pro);
export const PRO_FEATURES = FEATURES.filter((f) => f.pro);
