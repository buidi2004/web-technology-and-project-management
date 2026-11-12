export interface QrPayload {
  activityId: number;
  code: string;
}

/** QR có dạng ctxh:{activityId}:{checkInCode}. */
export function parseQrPayload(raw: string): QrPayload | null {
  const [tag, id, ...rest] = raw.trim().split(':');
  const activityId = Number(id);
  const code = rest.join(':');

  if (tag !== 'ctxh' || !Number.isInteger(activityId) || activityId <= 0 || !code) {
    return null;
  }

  return { activityId, code };
}
