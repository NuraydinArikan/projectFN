import { redirect } from "next/navigation";
import { requireGazeteci, AuthError } from "@/lib/auth";
import { isWritePathConfigured } from "@/lib/env";
import { listEditorHaberler } from "@/lib/editor-veri";
import { EditorListe } from "./EditorListe";

export default async function EditorIndexPage() {
  let gazeteci;
  try {
    gazeteci = await requireGazeteci();
  } catch (e) {
    if (e instanceof AuthError && e.status === 401) {
      redirect("/giris?next=/editor");
    }
    // 503 vb. — yine de listeyi (boş) ve uyarıyı göster
    return (
      <EditorListe
        haberler={[]}
        gazeteciAd="—"
        yazmaHazir={false}
      />
    );
  }

  const haberler = await listEditorHaberler();

  return (
    <EditorListe
      haberler={haberler}
      gazeteciAd={gazeteci.ad}
      yazmaHazir={isWritePathConfigured()}
    />
  );
}
