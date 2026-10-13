export function toJsonTransform(_doc: unknown, ret: Record<string, any>) {
  ret.id = ret._id.toString();
  delete ret._id;
  return ret;
}