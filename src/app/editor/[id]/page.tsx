import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuthError, requireGazeteci } from "@/lib/auth";
import { getEditorHaber } from "@/lib/editor-veri";
import { EditorPaneli } from "../EditorPaneli";

export default async function EditorHaberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let gazeteci;
  try {
    gazeteci = await requireGazeteci();
  } catch (e) {
    if (e instanceof AuthError && e.status === 401) {
      redirect(`/giris?next=/editor/${id}`);
    }
    return (
      <div className="ed-root">
        <main className="wrap" style={{ paddingTop: 40 }}>
          <p className="karne-note" role="alert">
            {e instanceof Error ? e.message : "Yetki hatası"}
          </p>
          <p>
            <Link href="/editor">← Editör listesi</Link>
          </p>
        </main>
      </div>
    );
  }

  const haber = await getEditorHaber(id);
  if (!haber) notFound();

  return <EditorPaneli haber={haber} gazeteciAd={gazeteci.ad} />;
}
