import type { VadReview } from './webMcpTools';

let reviewPending = false;

/** Only a trusted click in the visible dialog approves; input flags never grant authority. */
export function requestVadHumanReview({ tool, input, signal }: VadReview): Promise<boolean> {
  if (reviewPending || signal?.aborted) return Promise.resolve(false);
  reviewPending = true;
  return new Promise(resolve => {
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-labelledby', 'vad-webmcp-review-title');
    Object.assign(dialog.style, { maxWidth: 'min(32rem, 90vw)', padding: '1.5rem', border: '2px solid #7465ef', borderRadius: '12px', background: '#10172c', color: '#f5f4ff' });
    const title = document.createElement('h2');
    title.id = 'vad-webmcp-review-title';
    title.textContent = 'Revue humaine WebMCP';
    const description = document.createElement('p');
    description.textContent = tool === 'vad_export_review_receipt'
      ? 'Exporter le graphe affiché dans un fichier local pour une revue. Ce fichier ne devient pas une preuve authentifiée.'
      : 'Préparer une référence privée pour Qbit. Aucun envoi ni changement de progression ne sera effectué.';
    const details = document.createElement('pre');
    details.style.whiteSpace = 'pre-wrap';
    details.style.overflowWrap = 'anywhere';
    details.textContent = `${tool}\nGraphe : ${input.graph_ref}\nRévision : ${input.expected_revision}${input.receipt_id ? `\nRéférence : ${input.receipt_id}` : ''}`;
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = 'Refuser';
    cancel.autofocus = true;
    const approve = document.createElement('button');
    approve.type = 'button';
    approve.textContent = 'Approuver cette action';
    for (const button of [cancel, approve]) Object.assign(button.style, { margin: '.4rem', padding: '.6rem .8rem', border: '1px solid currentColor', borderRadius: '6px' });
    dialog.append(title, description, details, cancel, approve);
    let settled = false;
    const finish = (confirmed: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
      dialog.close();
      dialog.remove();
      reviewPending = false;
      resolve(confirmed);
    };
    const abort = () => finish(false);
    const timeout = window.setTimeout(abort, 120_000);
    cancel.addEventListener('click', () => finish(false));
    approve.addEventListener('click', event => { if (event.isTrusted) finish(true); });
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
    signal?.addEventListener('abort', abort, { once: true });
    document.body.append(dialog);
    try { dialog.showModal(); } catch { finish(false); }
  });
}
