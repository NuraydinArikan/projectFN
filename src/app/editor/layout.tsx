import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editör — Project FN",
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
