export default function toUTCDate(dateStr) {
  return dateStr ? new Date(`${dateStr}T00:00:00Z`) : null;
}
